import type { ActionArgs} from "@remix-run/node";
import { redirect} from "@remix-run/node";
import { Form, useActionData, useParams } from "@remix-run/react";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

function validateName(name: unknown) {
    if (name === "") {
        return `Ingresa un nombre`;
    }
}

function validateCatalogueId(catalogueId: unknown) {
    if (catalogueId === "") {
        return `Selecciona un catálogo`;
    }
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");
    const catalogueId = params.catalogueId;

    if (
        typeof name !== "string" ||
        typeof catalogueId !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
        });
    }
    const fields = { name, catalogueId };
    const fieldErrors = {
        name: validateName(name),
        catalogueId: validateCatalogueId(catalogueId),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    await db.company.create({
        data: { ...fields }
    });

    return redirect(`/dashboard/catalogues/show/${params.catalogueId}`);
}

export default function NewCompany() {
    const actionData = useActionData<typeof action>();
    const params = useParams();

    return (
        <div>
            <BackButton uri={`/dashboard/catalogues/show/${params.catalogueId}`} />
            <Form method="post">
                <div className="my-6">
                    <input type="text" name="name" placeholder="Nombre de la empresa" className="input input-bordered w-full max-w-xs" />
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