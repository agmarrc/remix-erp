import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import FormError from "~/components/FormError";

import TextInput from "~/components/TextInput";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { createUserSession, getUserId, login, register } from "~/utils/session.server";

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

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await getUserId(request);
    if (userId) {
        return redirect('/dashboard');
    }
    return json({});
};

export const action = async ({ request }: ActionArgs) => {
    const form = await request.formData();
    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `Form not submitted correctly.`,
        });
    }

    const fields = { name, email, password };
    const fieldErrors = {
        name: validateName(name),
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
    const user = await register({ name, email, password });
    if (!user) {
        return badRequest({
            fieldErrors: null,
            fields,
            formError: `Something went wrong trying to create a new user.`,
        });
    }
    return createUserSession(`${user.id}`, '/dashboard');
}

export default function Login() {
    const actionData = useActionData<typeof action>();

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">Registrate</h1>
                </div>
                <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <div className="card-body">
                        <Form method="post">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Nombre</span>
                                </label>
                                <input type="text" placeholder="Marco García" name="name" className="input input-bordered" />
                                <FormError error={actionData?.fieldErrors?.name} />
                            </div>
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
                            <div className="form-control mt-6">
                                <button className="btn btn-primary">Crear cuenta</button>
                            </div>
                            <label className="label">
                                <Link to="/auth/login" className="label-text-alt link link-hover">Ya tengo una cuenta</Link>
                            </label>
                            <FormError error={actionData?.formError} />
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}