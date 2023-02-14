import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useCatch, useParams } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import { ERROR_PERMISSION_CREATE, ERROR_RESOURCE_NOT_FOUND, ERROR_UNEXPECTED } from "~/data/constants";
import { db } from "~/utils/db.server";
import { hasPermission } from "~/utils/permission.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

function validateName(name: unknown) {
    if (name === "") {
        return `Ingresa un nombre`;
    }
}

function validateLocationId(locationId: unknown) {
    if (locationId === "") {
        return `Selecciona una sede`;
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

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await requireUserId(request);
    const canCreate = await hasPermission({ resource: 'module', query: { userId: userId, create: true } });
    if (!canCreate) throw new Response(ERROR_PERMISSION_CREATE, { status: 403 });
    return null;
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");
    const locationId = params.locationId;
    const workers = form.get("workers");

    const userId = await requireUserId(request);
    const canCreate = await hasPermission({ resource: 'module', query: { userId: userId, create: true } });
    if (!canCreate) throw new Response(ERROR_PERMISSION_CREATE, { status: 403 });

    if (
        typeof name !== "string" ||
        typeof locationId !== "string" ||
        typeof workers !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
        });
    }

    const location = await db.location.findUnique({
        where: { id: locationId }
    });

    if (!location) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 })

    const catalogueId = location.catalogueId;
    const fields = { name, locationId, catalogueId, workers };
    const fieldErrors = {
        name: validateName(name),
        locationId: validateLocationId(locationId),
        workers: validateWorkers(workers)
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    await db.module.create({
        data: { ...fields, workers: parseInt(workers) }
    })

    return redirect(`/dashboard/locations/show/${params.locationId}`);
}

export default function NewCompany() {
    const actionData = useActionData<typeof action>();
    const params = useParams();

    return (
        <div>
            <BackButton uri={`/dashboard/locations/show/${params.locationId}`} />
            <Form method="post">
                <div className="form-control my-6">
                    <label>Nombre del módulo</label>
                    <input type="text" name="name" placeholder="Nombre del módulo" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="form-control my-6">
                    <label>Número de trabajadores</label>
                    <input type="number" name="workers" placeholder="Número de trabajadores" className="input input-bordered w-full max-w-xs" />
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