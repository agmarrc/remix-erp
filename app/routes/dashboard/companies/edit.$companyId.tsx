import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import { Form, Link, useActionData, useCatch, useLoaderData } from "@remix-run/react";
import { redirect, useParams } from "react-router";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

function validateName(name: unknown) {
    if (name === "") {
        return `Ingresa un nombre`;
    }
}

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request);
    const company = await db.company.findUnique({
        where: { id: params.companyId }
    });
    if (!company) {
        throw new Response("No se encontró el recurso", {
            status: 404
        });
    }

    if (company.userId !== userId) {
        throw new Response("No tienes permisos para editar este recurso", {
            status: 403
        });
    }

    return json({ company, isOwner: userId === company.userId });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get('name');

    if (typeof name !== "string") {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: "El formulario no se envió correctamente"
        });
    }

    const fields = { name };
    const fieldErrors = {
        name: validateName(name),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    await db.company.update({
        where: {
            id: params.companyId
        },
        data: {
            name: name
        }
    });

    return redirect('/dashboard/companies');
}

export default function EditCompany() {
    const { company } = useLoaderData<typeof loader>();
    const actionData = useActionData();

    return (
        <div className="mt-6">
            <BackButton uri={`/dashboard/companies/show/${company.id}`} />
            <h3 className="text-xl">Editar</h3>
            <Form method="post">
                <div className="my-6">
                    <input type="text" name="name" defaultValue={company.name} placeholder="Nombre de la empresa" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="modal-action">
                    <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
            </Form>
        </div>
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
            return <Alert type="alert-error">No puedes editar la empresa con id {params.companyId} porque no tienes permisos suficientes</Alert>
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