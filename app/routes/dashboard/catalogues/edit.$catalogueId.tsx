import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData, useTransition } from "@remix-run/react";
import { redirect } from "react-router";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import { ERROR_PERMISSION_EDIT, ERROR_RESOURCE_NOT_FOUND, ERROR_UNEXPECTED } from "~/data/constants";
import { db } from "~/utils/db.server";
import { hasPermission } from "~/utils/permission.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

function validateName(name: unknown) {
    if (name === "") {
        return `Ingresa un nombre`;
    }
}

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request);

    const canEdit = await hasPermission({ resource: 'catalogue', query: { catalogueId: params.catalogueId, userId: userId, edit: true } })

    if (!canEdit) throw new Response(ERROR_PERMISSION_EDIT, { status: 403 });

    const catalogue = await db.catalogue.findUnique({
        where: { id: params.catalogueId }
    });
    if (!catalogue) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    return json({ catalogue });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get('name');

    const userId = await requireUserId(request);

    const canEdit = await hasPermission({ resource: 'catalogue', query: { catalogueId: params.catalogueId, userId: userId, edit: true } })

    if (!canEdit) throw new Response(ERROR_PERMISSION_EDIT, { status: 403 });

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

    await db.catalogue.update({
        where: {
            id: params.catalogueId
        },
        data: {
            name: name
        }
    });

    return redirect(`/dashboard/catalogues/show/${params.catalogueId}`);
}

export default function EditCatalogue() {
    const { catalogue } = useLoaderData<typeof loader>();
    const actionData = useActionData();
    const { state } = useTransition();

    return (
        <div className="mt-6">
            <BackButton uri={`/dashboard/catalogues/show/${catalogue.id}`} />
            <h3 className="text-xl">Editar</h3>
            <Form method="post">
                <div className="form-control my-6">
                    <label>Nombre del catálogo</label>
                    <input type="text" name="name" defaultValue={catalogue.name} placeholder="Nombre del catálogo" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="modal-action">
                    <button type="submit" disabled={state === 'submitting'} className="btn btn-primary">Guardar</button>
                </div>
            </Form>
        </div>
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