import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useParams } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import CardContainer from "~/components/Cards/CardContainer";
import CompanyCard from "~/components/Cards/CompanyCard";
import { db } from "~/utils/db.server";
import { hasPermission } from "~/utils/permission.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request);

    const canEdit = await hasPermission({ resource: 'catalogue', query: { catalogueId: params.catalogueId, userId: userId, edit: true } });
    const canDestroy = await hasPermission({ resource: 'catalogue', query: { catalogueId: params.catalogueId, userId: userId, destroy: true } });

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
        throw new Response("Recurso no encontrado", {
            status: 404
        });
    }
    return json({ catalogue, canDestroy, canEdit });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    if (form.get('intent') !== 'delete') return null;

    const userId = await requireUserId(request);

    const canDestroy = await hasPermission({ resource: 'catalogue', query: { catalogueId: params.catalogueId, userId: userId, destroy: true } });

    if (!canDestroy) throw new Response("No tienes permisos para eliminar este recurso", {
        status: 403
    });

    const catalogue = await db.catalogue.findUnique({
        where: { id: params.catalogueId },
    });
    if (!catalogue) {
        throw new Response("Este recurso no existe", {
            status: 404,
        });
    }
    await db.catalogue.delete({ where: { id: params.catalogueId } });
    return redirect("/dashboard");
}

export default function Catalogue() {
    const { catalogue, canDestroy, canEdit } = useLoaderData<typeof loader>();
    const companies = catalogue.companies;

    return (
        <>
            <BackButton uri="/dashboard" />
            <CardContainer>
                <div className="card w-full card-compact bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            {catalogue.name}
                        </h2>
                        <div className="card-actions justify-end">
                            {
                                canEdit &&
                                <Link to={`/dashboard/catalogues/edit/${catalogue.id}`} className="btn btn-primary">Editar</Link>
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

            <div className="flex gap-5 justify-between">
                <h3 className="text-xl">Empresas en este catálogo</h3>
                <Link to={`/dashboard/companies/new/${catalogue.id}`} className="btn btn-primary">Nueva empresa</Link>
            </div>

            {companies.length === 0
                ? <h3>Aún no hay empresas.</h3>
                : <CardContainer>
                    {companies.map((company) => <CompanyCard company={company} key={company.id} />)}
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
        case 404: {
            return <Alert type="alert-error">{caught.data}</Alert>

        }
        case 403: {
            return <Alert type="alert-error">{caught.data}</Alert>
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