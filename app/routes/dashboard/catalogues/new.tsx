import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useCatch } from "@remix-run/react";
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

export const loader = async ({request}: LoaderArgs) => {
    const userId = await requireUserId(request);

    const canDestroy = await db.cataloguePermission.findFirst({
        where: { userId: userId, create: true }
    });

    if (!canDestroy) throw new Response("No tienes permisos para crear este recurso", {
        status: 403
    });

    return null;
}

export const action = async ({ request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");

    if (
        typeof name !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
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

    await db.catalogue.create({
        data: { ...fields }
    });

    return redirect('/dashboard');
}

export default function NewCatalogue() {
    const actionData = useActionData<typeof action>();

    return (
        <div>
            <BackButton uri="/dashboard" />
            <Form method="post">
                <div className="my-6">
                    <input type="text" name="name" placeholder="Nombre del catálogo" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="modal-action">
                    <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
                <FormError error={actionData?.formError} />
            </Form>
        </div>
    );
}

export function CatchBoundary() {
    const caught = useCatch();

    switch (caught.status) {
        case 403: {
            return <Alert type="alert-error">{caught.data}</Alert>
        }
        default: {
            throw new Error(`Unhandled error: ${caught.status}`);
        }
    }
}

export function ErrorBoundary() {
    return (
        <div className="error-container">Ocurrió un error cargando la información</div>
    );
}