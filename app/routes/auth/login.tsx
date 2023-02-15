import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import FormError from "~/components/FormError";

import { badRequest } from "~/utils/request.server";
import { createUserSession, getUserId, login } from "~/utils/session.server";

function validateEmail(email: unknown) {
    if (typeof email !== "string" || email.length < 3) {
        return `Ingresa un email valido`;
    }
}

function validatePassword(password: unknown) {
    if (password === "") {
        return `Ingresa una contraseña`;
    }
}

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await getUserId(request);
    if (userId) {
        return redirect('/dashboard');
    }
    return json({});
};

export const action = async ({ request }: ActionArgs) => {
    const form = await request.formData();
    const email = form.get("email");
    const password = form.get("password");

    if (
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió de forma correcta.`,
        });
    }

    const fields = { email, password };
    const fieldErrors = {
        email: validateEmail(email),
        password: validatePassword(password),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    const user = await login({ email, password });
    if (!user) {
        return badRequest({
            fieldErrors: null,
            fields,
            formError: `Email o contraseña incorrecta`,
        });
    }
    return createUserSession(`${user.id}`, '/dashboard');
}

export default function Login() {
    const actionData = useActionData<typeof action>();
    const { state } = useTransition();

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">Inicia sesión</h1>
                </div>
                <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <div className="card-body">
                        <Form method="post">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email</span>
                                </label>
                                <input type="text" placeholder="my@email.com" name="email" className="input input-bordered" />
                                <FormError error={actionData?.fieldErrors?.email} />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Contraseña</span>
                                </label>
                                <input type="password" placeholder="********" name="password" className="input input-bordered" />
                                <FormError error={actionData?.fieldErrors?.password} />
                            </div>
                            <label className="label">
                                <Link to="/auth/recovery" className="label-text-alt link link-hover">¿Olvidaste tu contraseña?</Link>
                            </label>
                            <div className="form-control mt-6">
                                <button type="submit" disabled={state === 'submitting'} className="btn btn-primary">Iniciar sesión</button>
                            </div>
                            <FormError error={actionData?.formError} />
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}