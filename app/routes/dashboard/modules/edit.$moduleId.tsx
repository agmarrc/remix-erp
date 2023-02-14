import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData } from "@remix-run/react";
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

function validateWorkers(workers: unknown) {
    if (workers === "") {
        return `Debes ingresar el número de empleados de este módulo`;
    }
    if (typeof workers !== "string") {
        return "El campo trabajadores es incorrecto";
    }
    if (!parseInt(workers)) {
        return "El campo trabajadores debe ser un número"
    }
}

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request);

    const canEdit = await hasPermission({ resource: 'module', query: { moduleId: params.moduleId, userId: userId, edit: true } })

    if (!canEdit) throw new Response(ERROR_PERMISSION_EDIT, { status: 403 });

    const module = await db.module.findUnique({
        where: { id: params.moduleId }
    });

    if (!module) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    return json({ module });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");
    const workers = form.get("workers");

    const userId = await requireUserId(request);

    const canEdit = await hasPermission({ resource: 'module', query: { moduleId: params.moduleId, userId: userId, edit: true } })

    if (!canEdit) throw new Response(ERROR_PERMISSION_EDIT, { status: 403 });

    if (
        typeof name !== "string" ||
        typeof workers !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
        });
    }

    const fields = { name, workers };
    const fieldErrors = {
        name: validateName(name),
        workers: validateWorkers(workers)
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    await db.module.update({
        where: {
            id: params.moduleId
        },
        data: {
            ...fields, workers: parseInt(workers)
        }
    });

    return redirect(`/dashboard/modules/show/${params.moduleId}`);
}

export default function EditModule() {
    const { module } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    return (
        <div>
            <BackButton uri={`/dashboard/modules/show/${module.id}`} />
            <Form method="post">
                <div className="my-6">
                    <input type="text" name="name" placeholder="Nombre del módulo" defaultValue={module.name} className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="my-6">
                    <input type="number" name="workers" placeholder="Número de trabajadores" defaultValue={module.workers} className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.workers} />
                </div>
                <div className="modal-action mt-20">
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