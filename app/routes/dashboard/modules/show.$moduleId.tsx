import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useParams } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import CardContainer from "~/components/Cards/CardContainer";
import { db } from "~/utils/db.server";

export const loader = async ({ params }: LoaderArgs) => {
    const module = await db.module.findUnique({
        where: { id: params.moduleId },
    });

    if (!module) {
        throw new Response('No se encontró el módulo', {
            status: 404
        });
    }

    return json({ module });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    if (form.get('intent') !== 'delete') return null;

    const module = await db.module.findUnique({
        where: { id: params.moduleId }
    });

    if (!module) throw new Response("Este recurso no existe", {
        status: 404
    });

    await db.module.delete({ where: { id: params.moduleId } });
    return redirect(`/dashboard/locations/show/${module.locationId}`);
}

export default function ShowModule() {
    const { module } = useLoaderData<typeof loader>();

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
                        <div className="card-actions justify-end">
                            <Link to={`/dashboard/modules/edit/${module.id}`} className="btn btn-primary">Editar</Link>
                            <Form method="post">
                                <button className="btn btn-secondary" name="intent" value="delete">Eliminar</button>
                            </Form>
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
        case 404: {
            return <Alert type="alert-error">{caught.data}</Alert>
        }
        default: {
            throw new Error(`Unhandled error: ${caught.status}`);
        }
    }
}

export function ErrorBoundary() {
    const { locationId } = useParams();

    return (
        <Alert type="alert-error">Ocurrió un error procesando la sede con id {locationId}</Alert>
    )
}