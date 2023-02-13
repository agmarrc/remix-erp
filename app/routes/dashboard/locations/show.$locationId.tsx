import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useParams } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import CardContainer from "~/components/CardContainer";
import LocationMap from "~/components/LocationMap";
import ModuleCard from "~/components/ModuleCard";
import { db } from "~/utils/db.server";

export const loader = async ({ params }: LoaderArgs) => {
    const location = await db.location.findUnique({
        where: { id: params.locationId },
        include: {
            modules: true
        }
    });

    if (!location) {
        throw new Response('No se encontró la sede', {
            status: 404
        });
    }

    return json({ location });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    if (form.get('intent') !== 'delete') return null;

    const location = await db.location.findUnique({
        where: { id: params.locationId }
    });

    if (!location) throw new Response("Este recurso no existe", {
        status: 404
    });

    await db.location.delete({ where: { id: params.locationId } });
    return redirect(`/dashboard/companies/show/${location.companyId}`);
}

export default function ShowLocation() {
    const { location } = useLoaderData<typeof loader>();
    const modules = location.modules;

    return (
        <>
            <BackButton uri={`/dashboard/companies/show/${location.companyId}`} />
            <CardContainer>
                <div className="card w-full card-compact bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {location.name}
                        </h2>
                        <div className="card-actions justify-end">
                            <Link to={`/dashboard/locations/edit/${location.id}`} className="btn btn-primary">Editar</Link>
                            <Form method="post">
                                <button className="btn btn-secondary" name="intent" value="delete">Eliminar</button>
                            </Form>
                        </div>
                    </div>
                </div>
            </CardContainer>

            <div className="my-10">
                <h3 className="text-xl">Ubicación</h3>
                <div className="h-80">
                    <LocationMap longitude={parseFloat(location.longitude)} latitude={parseFloat(location.latitude)} />
                </div>
            </div>

            <div className="flex gap-5 justify-between">
                <h3 className="text-xl">Módulos en esta sede</h3>
                <Link to={`/dashboard/modules/new/${location.id}`} className="btn btn-primary">Nuevo módulo</Link>
            </div>

            {modules.length === 0
                ? <h3>Aún no hay módulos.</h3>
                : <CardContainer>
                    {modules.map((module) => <ModuleCard module={module} key={module.id} />)}
                </CardContainer>
            }
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