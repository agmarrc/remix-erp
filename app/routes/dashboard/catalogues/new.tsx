import type { ActionArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

function validateName(name: unknown) {
    if (name === "") {
        return `Ingresa un nombre`;
    }
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

    return redirect('/dashboard/catalogues');
}

export default function NewCatalogue() {
    const actionData = useActionData<typeof action>();

    return (
        <div>
            <BackButton uri="/dashboard/catalogues" />
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