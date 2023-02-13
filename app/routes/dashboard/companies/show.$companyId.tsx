import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useParams } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import CardContainer from "~/components/CardContainer";
import LocationCard from "~/components/LocationCard";
import { db } from "~/utils/db.server";

export const loader = async ({ params }: LoaderArgs) => {
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
    if (!company) {
        throw new Response("Company not found", {
            status: 404
        });
    }
    return json({ company });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    if (form.get('intent') !== 'delete') return null;

    const company = await db.company.findUnique({
        where: { id: params.companyId },
    });
    if (!company) {
        throw new Response("Este recurso no existe", {
            status: 404,
        });
    }
    await db.company.delete({ where: { id: params.companyId } });
    return redirect(`/dashboard/catalogues/show/${company.catalogueId}`);
}

export default function Company() {
    const { company } = useLoaderData<typeof loader>();
    const locations = company.locations;

    return (
        <>
            <BackButton uri={`/dashboard/catalogues/show/${company.catalogueId}`} />
            <CardContainer>
                <div className="card w-full card-compact bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">{company.name}</h2>
                        <div className="card-actions justify-end">
                            <Link to={`/dashboard/companies/edit/${company.id}`} className="btn btn-primary">Editar</Link>
                            <Form method="post">
                                <button className="btn btn-secondary" name="intent" value="delete">Eliminar</button>
                            </Form>
                        </div>
                    </div>
                </div>
            </CardContainer>

            <div className="flex gap-5 justify-between">
                <h3 className="text-xl">Sedes en esta empresa</h3>
                <Link to={`/dashboard/locations/new/${company.id}`} className="btn btn-primary">Nueva sede</Link>
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
    const params = useParams();
    switch (caught.status) {
        case 400: {
            return <Alert type="alert-error">Acción no permitida</Alert>
        }
        case 404: {
            return <Alert type="alert-error">No se encontró la empresa con id {params.companyId}</Alert>

        }
        case 403: {
            return <Alert type="alert-error">No puedes eliminar la empresa con id {params.companyId} porque no tienes permisos suficientes</Alert>
        }
        default: {
            throw new Error(`Unhandled error: ${caught.status}`);
        }
    }
}

export function ErrorBoundary() {
    const { companyId } = useParams();
    return (
        <Alert type="alert-error">Occurió un error procesando la empresa con id {companyId}</Alert>
    );
}