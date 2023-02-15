import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useCatch, useLoaderData, useTransition } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import { ERROR_RESOURCE_NOT_FOUND, ERROR_UNEXPECTED } from "~/data/constants";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUser } from "~/utils/session.server";

function validateName(name: unknown) {
    if (typeof name !== "string" || name === "") {
        return `Ingresa un nombre valido`;
    }
}

function validateEmail(email: unknown) {
    if (typeof email !== "string" || email.length < 3) {
        return `Ingresa un email valido`;
    }
}

export const loader = async ({ params, request }: LoaderArgs) => {
    const sessionUser = await getUser(request);

    if (sessionUser?.role.privileges !== 1) return redirect('/dashboard');

    const user = await db.user.findUnique({
        where: { id: params.userId },
        include: { role: true }
    });

    if (!user) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    const allowChangeRole = (sessionUser.id === user.id) ? false : true;

    return json({ user, allowChangeRole });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");
    const email = form.get("email");
    let isAdmin = Boolean(form.get("isAdmin"));

    const sessionUser = await getUser(request);

    if (!sessionUser) throw new Response(ERROR_UNEXPECTED);

    const allowChangeRole = (sessionUser.id === params.userId) ? false : true;

    if (!allowChangeRole) isAdmin = true;

    if (
        typeof name !== "string" ||
        typeof email !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
        });
    }

    const fields = { name, email };
    const fieldErrors = {
        name: validateName(name),
        email: validateEmail(email),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    const privileges = isAdmin ? 1 : 2;

    const userRole = await db.role.findUnique({
        where: { privileges: privileges }
    });

    if (!userRole) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    await db.user.update({
        where: { id: params.userId },
        data: { name: name, email: email, roleId: userRole.id }
    })


    return redirect('/dashboard/users');
}

export default function EditUser() {
    const { user, allowChangeRole } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { state } = useTransition();

    return (
        <div>
            <BackButton uri={`/dashboard/users`} />

            <h3 className="text-xl">Editar usuario</h3>

            <Form method="post">
                <div className="form-control my-6">
                    <label>Nombre</label>
                    <input defaultValue={user.name} type="text" name="name" placeholder="Nombre" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="form-control my-6">
                    <label>Email</label>
                    <input defaultValue={user.email} type="email" name="email" placeholder="Email" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.email} />
                </div>
                {
                    allowChangeRole &&
                    <div className="my-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isAdmin" className="checkbox" />
                            <span className="label-text">Administrador</span>
                        </label>
                    </div>
                }
                <button disabled={state === 'submitting'} type="submit" className="btn btn-primary">Editar usuario</button>
                <FormError error={actionData?.formError} />
            </Form>
        </div>
    )
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
    )
}