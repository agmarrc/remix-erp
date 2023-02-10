import type { ActionArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import type { Coordinate } from "ol/coordinate";
import React, { useState } from "react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import PickerMap from "~/components/PickerMap";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

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

export const loader = async () => {
    const companies = await db.company.findMany();
    return json({ companies });
}

export const action = async ({ request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");
    const companyId = form.get("companyId");
    const placeName = form.get("placeName");
    const latitude = form.get("latitude");
    const longitude = form.get("longitude");

    if (
        typeof name !== "string" ||
        typeof companyId !== "string" ||
        typeof placeName !== "string" ||
        typeof latitude !== "string" ||
        typeof longitude !== "string"
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

    if (!company) {
        throw new Response('No se encontró la empresa', {
            status: 404
        })
    }

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

    return redirect('/dashboard/locations');
}

export default function NewCompany() {
    const { companies } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

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
        formData.set('latitude', String(location[0]));
        formData.set('longitude', String(location[1]));

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
            <BackButton uri="/dashboard/locations" />
            <Form onSubmit={onSubmit} method="post">
                <div className="my-6">
                    <select className="select w-full max-w-xs" name="companyId">
                        {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                    </select>
                    <FormError error={actionData?.fieldErrors?.companyId} />
                </div>
                <div className="my-6">
                    <input type="text" name="name" placeholder="Nombre de la sede" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="my-6">
                    <input type="text" name="placeName" placeholder="Nombre de la ubicación" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.placeName} />
                </div>
                <div className="h-80 my-6">
                    <h4 className="text-xl mb-2">Selecciona la ubicación</h4>
                    <PickerMap onPickLocation={onPickLocation} />
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