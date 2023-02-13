import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useParams } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import CardContainer from "~/components/CardContainer";
import CompanyCard from "~/components/CompanyCard";
import { db } from "~/utils/db.server";

export const loader = async ({ params }: LoaderArgs) => {
    const catalogue = await db.catalogue.findUnique({
        where: { id: params.catalogueId },
        include: {
            companies: {
                include: {
                    _count: {
                        select: { locations: true }
                    }
                }
            }, locations: true, modules: true
        }
    });
    if (!catalogue) {
        throw new Response("Catálogo no encontrado", {
            status: 404
        });
    }
    return json({ catalogue });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    if (form.get('intent') !== 'delete') return null;

    const catalogue = await db.catalogue.findUnique({
        where: { id: params.catalogueId },
    });
    if (!catalogue) {
        throw new Response("Este recurso no existe", {
            status: 404,
        });
    }
    await db.catalogue.delete({ where: { id: params.catalogueId } });
    return redirect("/dashboard/catalogues");
}

export default function Catalogue() {
    const { catalogue } = useLoaderData<typeof loader>();
    const companies = catalogue.companies;

    return (
        <>
            <BackButton uri="/dashboard/catalogues" />
            <CardContainer>
                <div className="card w-full card-compact bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">{catalogue.name}</h2>
                        <div className="card-actions justify-end">
                            <Link to={`/dashboard/catalogues/edit/${catalogue.id}`} className="btn btn-primary">Editar</Link>
                            <Form method="post">
                                <button className="btn btn-secondary" name="intent" value="delete">Eliminar</button>
                            </Form>
                        </div>
                    </div>
                </div>
            </CardContainer>
            <h3 className="text-xl">Empresas en este catálogo</h3>
            <CardContainer>
                {companies.length === 0
                    ? <h3>Aún no hay empresas.</h3>
                    : <CardContainer>
                        {companies.map((company) => <CompanyCard company={company} key={company.id} />)}
                    </CardContainer>
                }
            </CardContainer>
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
            return <Alert type="alert-error">No se encontró el catálogo con id {params.catalogueId}</Alert>

        }
        case 403: {
            return <Alert type="alert-error">No puedes eliminar el catálogo con id {params.catalogueId} porque no tienes permisos suficientes</Alert>
        }
        default: {
            throw new Error(`Unhandled error: ${caught.status}`);
        }
    }
}

export function ErrorBoundary() {
    const { catalogueId } = useParams();
    return (
        <div className="error-container">{`Ocurrió un error cargando la información de el catálogo con id ${catalogueId}.`}</div>
    );
}