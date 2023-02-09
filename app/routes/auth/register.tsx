import { ActionArgs } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import FormError from "~/components/FormError";

import TextInput from "~/components/TextInput";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { createUserSession, login, register } from "~/utils/session.server";

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
    return createUserSession(`${user.id}`, '/');
}

export default function Login() {
    const actionData = useActionData<typeof action>();

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <span className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    Flowbite
                </span>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Crea tu cuenta
                        </h1>
                        <Form className="space-y-4 md:space-y-6" method="post">
                            <div>
                                <TextInput id="name" labelText="Tu nombre" name="name" placeholder="Marco García" type="text" />
                                <FormError error={actionData?.fieldErrors?.name} />
                            </div>
                            <div>
                                <TextInput id="email" labelText="Tu email" name="email" placeholder="correo@empresa.com" type="email" />
                                <FormError error={actionData?.fieldErrors?.email} />
                            </div>
                            <div>
                                <TextInput id="password" labelText="Tu contraseña" name="password" placeholder="••••••••" type="password" />
                                <FormError error={actionData?.fieldErrors?.password} />
                            </div>
                            <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Ingresar</button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                ¿Ya tienes cuenta? <Link to="/auth/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Inicia sesión</Link>
                            </p>
                            <FormError error={actionData?.formError} />
                        </Form>
                    </div>
                </div>
            </div>
        </section>
    );
}