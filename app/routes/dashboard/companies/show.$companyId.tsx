import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useParams } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import CardContainer from "~/components/CardContainer";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request);
    const company = await db.company.findUnique({
        where: { id: params.companyId }
    });
    if (!company) {
        throw new Response("Company not found", {
            status: 404
        });
    }
    return json({ company, isOwner: userId === company.userId });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    if (form.get('intent') !== 'delete') return null;

    const userId = await requireUserId(request);
    const company = await db.company.findUnique({
        where: { id: params.companyId },
    });
    if (!company) {
        throw new Response("Este recurso no existe", {
            status: 404,
        });
    }
    if (company.userId !== userId) {
        throw new Response("No puedes eliminar este recurso", { status: 403 });
    }
    await db.company.delete({ where: { id: params.companyId } });
    return redirect("/dashboard/companies");
}

export default function Company() {
    const { company, isOwner } = useLoaderData<typeof loader>();

    return (
        <>
            <BackButton uri="/dashboard/companies" />
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
        <div className="error-container">{`Ocurrió un error cargando la información de la empresa con id ${companyId}.`}</div>
    );
}