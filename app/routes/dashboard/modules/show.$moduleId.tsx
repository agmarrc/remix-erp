import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import CardContainer from "~/components/Cards/CardContainer";
import { ERROR_PERMISSION_DESTROY, ERROR_RESOURCE_NOT_FOUND, ERROR_UNEXPECTED } from "~/data/constants";
import { db } from "~/utils/db.server";
import { hasPermission } from "~/utils/permission.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request);

    const canEdit = await hasPermission({ resource: 'module', query: { userId: userId, moduleId: params.moduleId, edit: true } });
    const canDestroy = await hasPermission({ resource: 'module', query: { userId: userId, moduleId: params.moduleId, destroy: true } });

    const module = await db.module.findUnique({
        where: { id: params.moduleId },
    });

    if (!module) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    return json({ module, canEdit, canDestroy });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    if (form.get('intent') !== 'delete') return null;

    const userId = await requireUserId(request);

    const canDestroy = await hasPermission({ resource: 'module', query: { userId: userId, moduleId: params.moduleId, destroy: true } });

    if (!canDestroy) throw new Response(ERROR_PERMISSION_DESTROY, { status: 403 })

    const module = await db.module.findUnique({
        where: { id: params.moduleId }
    });

    if (!module) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    await db.module.delete({ where: { id: params.moduleId } });
    return redirect(`/dashboard/locations/show/${module.locationId}`);
}

export default function ShowModule() {
    const { module, canDestroy, canEdit } = useLoaderData<typeof loader>();

    return (
        <>
            <BackButton uri={`/dashboard/locations/show/${module.locationId}`} />
            <CardContainer>
                <div className="card w-full card-compact bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                            </svg>
                            {module.name}
                        </h2>
                        <p><strong>{module.workers} trabajadores</strong></p>
                        <div className="card-actions justify-end">
                            {
                                canEdit &&
                                <Link to={`/dashboard/modules/edit/${module.id}`} className="btn btn-primary">Editar</Link>
                            }
                            {
                                canDestroy &&
                                <Form method="post">
                                    <button className="btn btn-secondary" name="intent" value="delete">Eliminar</button>
                                </Form>
                            }
                        </div>
                    </div>
                </div>
            </CardContainer>
        </>
    )
}

export function CatchBoundary() {
    const caught = useCatch();

    switch (caught.status) {
        case 403: {
            return <Alert type="alert-error">{caught.data}</Alert>
        }
        case 404: {
            return <Alert type="alert-error">{caught.data}</Alert>
        }
        default: {
            throw new Error(`Unhandled error: ${caught.status}`);
        }
    }
}

export function ErrorBoundary() {
    return (
        <Alert type="alert-error">{ERROR_UNEXPECTED}</Alert>
    )
}