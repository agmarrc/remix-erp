import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useCatch, useParams } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import { ERROR_PERMISSION_CREATE, ERROR_UNEXPECTED } from "~/data/constants";
import { db } from "~/utils/db.server";
import { hasPermission } from "~/utils/permission.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

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

export const loader = async ({ params, request }: LoaderArgs) => {
    const userId = await requireUserId(request);

    const canCreate = await hasPermission({ resource: 'company', query: { userId: userId, create: true } });

    if (!canCreate) throw new Response(ERROR_PERMISSION_CREATE, { status: 403 });

    return null;
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

export function CatchBoundary() {
    const caught = useCatch();

    switch (caught.status) {
        case 403: {
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
    )
}