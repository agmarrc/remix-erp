import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form, useActionData, useCatch, useTransition } from "@remix-run/react";
import { redirect } from "react-router";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import FormError from "~/components/FormError";
import { ERROR_UNEXPECTED } from "~/data/constants";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUser, register } from "~/utils/session.server";

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

function validatePassword(password: unknown) {
    if (typeof password != "string" || password.length < 8) {
        return `La contraseña debe tener al menos 8 caracteres`;
    }
}

function validateConfirmPassword(password: string, confirmPassword: unknown) {
    if (typeof confirmPassword != "string") {
        return `Debes repetir tu contraseña`;
    }
    if (password !== confirmPassword) {
        return "Las contraseñas no coinciden"
    }
}

export const loader = async ({ request }: LoaderArgs) => {
    const user = await getUser(request);

    if (user?.role.privileges !== 1) return redirect('/dashboard');

    return null;
}

export const action = async ({ request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");
    const isAdmin = Boolean(form.get("isAdmin"));

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
        });
    }

    const fields = { name, email, password, confirmPassword };
    const fieldErrors = {
        name: validateName(name),
        email: validateEmail(email),
        password: validatePassword(password),
        confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    const userExists = await db.user.findFirst({
        where: { email },
    });
    if (userExists) {
        return badRequest({
            fieldErrors: null,
            fields,
            formError: `El correo ${email} ya está en uso`,
        });
    }

    const user = await register({ name, email, password, isAdmin });
    if (!user) {
        return badRequest({
            fieldErrors: null,
            fields,
            formError: `Algo salió mal intentando crear el nuevo usuario.`,
        });
    }
    return redirect('/dashboard/users');
}

export default function NewUser() {
    const actionData = useActionData<typeof action>();
    const { state } = useTransition();

    return (
        <div>
            <BackButton uri={`/dashboard/users`} />

            <h3 className="text-xl">Nuevo usuario</h3>

            <Form method="post">
                <div className="form-control my-6">
                    <label>Nombre</label>
                    <input type="text" name="name" placeholder="Nombre" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.name} />
                </div>
                <div className="form-control my-6">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="Email" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.email} />
                </div>
                <div className="form-control my-6">
                    <label>Contraseña</label>
                    <input type="password" name="password" placeholder="Contraseña" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.password} />
                </div>
                <div className="form-control my-6">
                    <label>Repite contraseña</label>
                    <input type="password" name="confirmPassword" placeholder="Repite contraseña" className="input input-bordered w-full max-w-xs" />
                    <FormError error={actionData?.fieldErrors?.confirmPassword} />
                </div>
                <div className="my-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="isAdmin" className="checkbox" />
                        <span className="label-text">Administrador</span>
                    </label>
                </div>
                <button disabled={state === 'submitting'} type="submit" className="btn btn-primary">Crear usuario</button>
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
    )
}