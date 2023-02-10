import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
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

function validateCompanyId(companyId: unknown) {
    if (companyId === "") {
        return `Selecciona una empresa`;
    }
}

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await requireUserId(request);
    const companies = await db.company.findMany({
        where: { userId: userId }
    });
    return json({ companies });
}

export const action = async ({ request }: ActionArgs) => {
    const userId = await requireUserId(request);
    const form = await request.formData();
    const name = form.get("name");
    const companyId = form.get("companyId");

    if (
        typeof name !== "string" ||
        typeof companyId !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
        });
    }
    const fields = { name, companyId };
    const fieldErrors = {
        name: validateName(name),
        companyId: validateCompanyId(companyId),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    await db.campus.create({
        data: { ...fields, userId: userId }
    })

    return redirect('/dashboard/campus');
}

export default function NewCompany() {
    const { companies } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

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
            <BackButton uri="/dashboard/campus" />
            <Form method="post">
                <div className="my-6">
                    <select className="select w-full max-w-xs" name="companyId">
                        <option disabled selected>Selecciona empresa</option>
                        {companies.map((company) => <option value={company.id}>{company.name}</option>)}
                    </select>
                    <FormError error={actionData?.fieldErrors?.companyId} />
                </div>
                <div className="my-6">
                    <input type="text" name="name" placeholder="Nombre de la sede" className="input input-bordered w-full max-w-xs" />
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