import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import FormError from "~/components/FormError";

import TextInput from "~/components/TextInput";
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
            formError: `Form not submitted correctly.`,
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

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <span className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    Flowbite
                </span>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Entra a tu cuenta
                        </h1>
                        <Form className="space-y-4 md:space-y-6" method="post">
                            <div>
                                <TextInput id="email" labelText="Tu email" name="email" placeholder="correo@empresa.com" type="email" />
                                <FormError error={actionData?.fieldErrors?.email} />
                            </div>
                            <div>
                                <TextInput id="password" labelText="Tu contraseña" name="password" placeholder="••••••••" type="password" />
                                <FormError error={actionData?.fieldErrors?.password} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Link to="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">¿Olvidaste tu contraseña?</Link>
                            </div>
                            <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Ingresar</button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                ¿Aún no tienes una cuenta? <Link to="/auth/register" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Registrate</Link>
                            </p>
                            <FormError error={actionData?.formError} />
                        </Form>
                    </div>
                </div>
            </div>
        </section>
    );
}