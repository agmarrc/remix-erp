import { ActionArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import FormError from "~/components/FormError";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

function validateName(name: unknown) {
    if (name === "") {
        return `Ingresa un nombre`;
    }
}

export const action = async ({ request }: ActionArgs) => {
    const userId = await requireUserId(request);
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

    await db.company.create({
        data: { ...fields, userId: userId }
    });

    return redirect('/dashboard/companies');
}

export default function NewCompany() {
    const actionData = useActionData<typeof action>();

    return (
        <Form method="post">
            <div className="my-6">
                <input type="text" name="name" placeholder="Nombre de la empresa" className="input input-bordered w-full max-w-xs" />
                <FormError error={actionData?.fieldErrors?.name} />
            </div>
            <div className="modal-action">
                <Link to="/dashboard/companies" className="btn">Cancelar</Link>
                <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
        </Form>
    );
}