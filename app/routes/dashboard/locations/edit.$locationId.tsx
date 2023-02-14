import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData, useSubmit } from "@remix-run/react";
import type { Coordinate } from "ol/coordinate";
import { useState } from "react";
import { redirect } from "react-router";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import PickerMap from "~/components/PickerMap";
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

function validatePlaceName(placeName: unknown) {
    if (placeName === "") {
        return `Debes ingresar el nombre de la ubicación`;
    }
}

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request);

    const canEdit = await hasPermission({ resource: 'location', query: { locationId: params.locationId, userId: userId, edit: true } });

    if (!canEdit) throw new Response(ERROR_PERMISSION_EDIT, { status: 403 })

    const location = await db.location.findUnique({
        where: { id: params.locationId }
    });

    if (!location) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    return json({ location });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get('name');
    const placeName = form.get("placeName");
    const longitude = form.get("longitude");
    const latitude = form.get("latitude");

    const userId = await requireUserId(request);

    const canEdit = await hasPermission({ resource: 'location', query: { locationId: params.locationId, userId: userId, edit: true } });

    if (!canEdit) throw new Response(ERROR_PERMISSION_EDIT, { status: 403 });

    if (
        typeof name !== "string" ||
        typeof placeName !== "string" ||
        typeof longitude !== "string" ||
        typeof latitude !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
        });
    }

    const fields = { name, placeName, latitude, longitude };
    const fieldErrors = {
        name: validateName(name),
        placeName: validatePlaceName(placeName)
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    await db.location.update({
        where: {
            id: params.locationId
        },
        data: {
            ...fields
        }
    });

    return redirect(`/dashboard/locations/show/${params.locationId}`);
}

export default function EditLocation() {
    const { location } = useLoaderData<typeof loader>();
    const actionData = useActionData();

    const submit = useSubmit();

    const [locationMap, setLocationMap] = useState<Coordinate>([parseFloat(location.longitude), parseFloat(location.latitude)]);
    const [locationError, setLocationError] = useState<string | null>(null);

    const onPickLocation = (coordinate: Coordinate) => {
        setLocationMap(coordinate);
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!locationMap) return setLocationError('Debes seleccionar la ubicación en el mapa');

        setLocationError(null);

        const $form = e.currentTarget;

        const formData = new FormData($form);
        formData.set('longitude', String(locationMap[0]));
        formData.set('latitude', String(locationMap[1]));

        submit(formData, {
            method: "post",
        });
    }

    return (
        <div className="mt-6">
            <BackButton uri={`/dashboard/locations/show/${location.id}`} />
            <h3 className="text-xl">Editar</h3>
            <Form onSubmit={onSubmit} method="post">
                <div className="form-control my-6">
                    <label>Nombre de la sede</label>
                    <input type="text" name="name" placeholder="Nombre de la sede" defaultValue={location.name} className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="form-control my-6">
                    <label>Nombre de la ubicación</label>
                    <input type="text" name="placeName" placeholder="Nombre de la ubicación" defaultValue={location.placeName} className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.placeName} />
                </div>
                <div className="h-80 my-6">
                    <h4 className="text-xl mb-2">Selecciona la ubicación</h4>
                    <PickerMap hasMarker={true} latitude={parseFloat(location.latitude)} longitude={parseFloat(location.longitude)} onPickLocation={onPickLocation} />
                    <FormError error={locationError} />
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