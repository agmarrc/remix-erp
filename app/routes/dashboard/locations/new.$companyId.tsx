import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useCatch, useLoaderData, useParams, useSubmit, useTransition } from "@remix-run/react";
import type { Coordinate } from "ol/coordinate";
import React, { useState } from "react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import PickerMap from "~/components/PickerMap";
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

function validateCompanyId(companyId: unknown) {
    if (companyId === "") {
        return `Selecciona una empresa`;
    }
}

function validatePlaceName(placeName: unknown) {
    if (placeName === "") {
        return `Debes ingresar el nombre de la ubicación`;
    }
}

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await requireUserId(request);

    const canCreate = await hasPermission({ resource: 'location', query: { userId: userId, create: true } });

    if (!canCreate) throw new Response(ERROR_PERMISSION_CREATE, { status: 403 })

    const companies = await db.company.findMany();
    return json({ companies });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");
    const companyId = params.companyId;
    const placeName = form.get("placeName");
    const longitude = form.get("longitude");
    const latitude = form.get("latitude");

    if (
        typeof name !== "string" ||
        typeof companyId !== "string" ||
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

    const company = await db.company.findUnique({
        where: { id: companyId }
    });

    if (!company) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 })

    const catalogueId = company.catalogueId;
    const fields = { name, companyId, catalogueId, placeName, latitude, longitude };
    const fieldErrors = {
        name: validateName(name),
        companyId: validateCompanyId(companyId),
        placeName: validatePlaceName(placeName)
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    await db.location.create({
        data: { ...fields }
    })

    return redirect(`/dashboard/companies/show/${params.companyId}`);
}

export default function NewCompany() {
    const { companies } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const params = useParams();
    const { state } = useTransition();

    const submit = useSubmit();

    const [location, setLocation] = useState<Coordinate | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    const onPickLocation = (coordinate: Coordinate) => {
        setLocation(coordinate);
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!location) return setLocationError('Debes seleccionar la ubicación en el mapa');

        setLocationError(null);

        const $form = e.currentTarget;

        const formData = new FormData($form);
        formData.set('longitude', String(location[0]));
        formData.set('latitude', String(location[1]));

        submit(formData, {
            method: "post",
        });
    }

    if (companies.length === 0) {
        return (
            <>
                <Alert type="alert-error">Aún no tienes empresas. Primero debes crear una empresa.</Alert>
                <Link className="btn btn-primary" to="/dashboard/companies/new">Crear</Link>
            </>
        )
    }

    return (
        <div>
            <BackButton uri={`/dashboard/companies/show/${params.companyId}`} />
            <Form onSubmit={onSubmit} method="post">
                <div className="form-control my-6">
                    <label>Nombre de la sede</label>
                    <input type="text" name="name" placeholder="Nombre de la sede" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="form-control my-6">
                    <label>Nombre de la ubicación</label>
                    <input type="text" name="placeName" placeholder="Nombre de la ubicación" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.placeName} />
                </div>
                <div className="h-80 my-6">
                    <h4 className="text-xl mb-2">Selecciona la ubicación</h4>
                    <PickerMap onPickLocation={onPickLocation} />
                    <FormError error={locationError} />
                </div>
                <div className="modal-action mt-20">
                    <button disabled={state === 'submitting'} type="submit" className="btn btn-primary">Guardar</button>
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