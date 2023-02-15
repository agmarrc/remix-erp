import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useTransition } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import CardContainer from "~/components/Cards/CardContainer";
import LocationCard from "~/components/Cards/LocationCard";
import { ERROR_PERMISSION_DESTROY, ERROR_RESOURCE_NOT_FOUND, ERROR_UNEXPECTED } from "~/data/constants";
import { db } from "~/utils/db.server";
import { hasPermission } from "~/utils/permission.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request);

    const canCreate = await hasPermission({ resource: 'location', query: { userId: userId, create: true } });
    const canEdit = await hasPermission({ resource: 'company', query: { companyId: params.companyId, userId: userId, edit: true } });
    const canDestroy = await hasPermission({ resource: 'company', query: { companyId: params.companyId, userId: userId, destroy: true } });

    const company = await db.company.findUnique({
        where: { id: params.companyId },
        include: {
            locations: {
                include: {
                    _count: {
                        select: {
                            modules: true
                        }
                    }
                }
            }
        }
    });
    if (!company) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    return json({ company, canDestroy, canEdit, canCreate });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    if (form.get('intent') !== 'delete') return null;

    const userId = await requireUserId(request);

    const canDestroy = await hasPermission({ resource: 'company', query: { companyId: params.companyId, userId: userId, destroy: true } });

    if (!canDestroy) throw new Response(ERROR_PERMISSION_DESTROY, { status: 403 });

    const company = await db.company.findUnique({
        where: { id: params.companyId },
    });
    if (!company) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    await db.company.delete({ where: { id: params.companyId } });
    return redirect(`/dashboard/catalogues/show/${company.catalogueId}`);
}

export default function Company() {
    const { company, canDestroy, canEdit, canCreate } = useLoaderData<typeof loader>();
    const locations = company.locations;
    const { state } = useTransition();

    return (
        <>
            <BackButton uri={`/dashboard/catalogues/show/${company.catalogueId}`} />
            <CardContainer>
                <div className="card w-full card-compact bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                            </svg>
                            {company.name}
                        </h2>
                        <div className="card-actions justify-end">
                            {
                                canEdit &&
                                <Link to={`/dashboard/companies/edit/${company.id}`} className="btn btn-primary">Editar</Link>
                            }
                            {
                                canDestroy &&
                                <Form method="post">
                                    <button disabled={state === 'submitting'} type="submit" className="btn btn-secondary" name="intent" value="delete">Eliminar</button>
                                </Form>
                            }
                        </div>
                    </div>
                </div>
            </CardContainer>

            <div className="flex gap-5 justify-between">
                <h3 className="text-xl">Sedes en esta empresa</h3>
                {
                    canCreate &&
                    <Link to={`/dashboard/locations/new/${company.id}`} className="btn btn-primary">Nueva sede</Link>
                }
            </div>

            {locations.length === 0
                ? <h3>Aún no hay sedes.</h3>
                : <CardContainer>
                    {locations.map((location) => <LocationCard location={location} key={location.id} />)}
                </CardContainer>
            }
        </>
    );
}

export function CatchBoundary() {
    const caught = useCatch();

    switch (caught.status) {
        case 400: {
            return <Alert type="alert-error">{caught.data}</Alert>
        }
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
    );
}