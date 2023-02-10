import type { ActionArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

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

export const loader = async () => {
    const locations = await db.location.findMany();
    return json({ locations });
}

export const action = async ({ request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");
    const locationId = form.get("locationId");
    const workers = form.get("workers");

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

    if (!location) {
        throw new Response('No se encontró la sede', {
            status: 404
        })
    }

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

    return redirect('/dashboard/modules');
}

export default function NewCompany() {
    const { locations } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    if (locations.length === 0) {
        return (
            <>
                <Alert type="alert-error">Aún no tienes sedes. Primero debes crear una sede.</Alert>
                <Link className="btn btn-primary" to="/dashboard/locations/new">Crear</Link>
            </>
        )
    }

    return (
        <div>
            <BackButton uri="/dashboard/modules" />
            <Form method="post">
                <div className="my-6">
                    <select className="select w-full max-w-xs" name="locationId">
                        {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                    </select>
                    <FormError error={actionData?.fieldErrors?.locationId} />
                </div>
                <div className="my-6">
                    <input type="text" name="name" placeholder="Nombre del módulo" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="my-6">
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