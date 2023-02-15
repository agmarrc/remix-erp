import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { redirect } from "react-router";
import FormError from "~/components/FormError";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserId } from "~/utils/session.server";
import { updatePassword } from "~/utils/user.server";

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

export const loader = async ({ request, params }: LoaderArgs) => {
    const userId = await getUserId(request);
    if (userId) {
        return redirect('/dashboard');
    }
    const recovery = await db.recovery.findUnique({
        where: { id: params.token }
    });

    if (!recovery) return redirect('/auth/recovery');

    return null;
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (
        typeof password !== "string" ||
        typeof confirmPassword !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
        });
    }

    const fields = { password, confirmPassword };
    const fieldErrors = {
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

    const recovery = await db.recovery.findUnique({
        where: { id: params.token }
    });

    if (!recovery) return redirect('/auth/recovery');

    await updatePassword(password, recovery.userId);

    await db.recovery.delete({
        where: { id: recovery.id }
    });

    return redirect('/auth/login');
}

export default function Reset() {
    const actionData = useActionData<typeof action>();
    const { state } = useTransition();

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">Restablece tu contraseña</h1>
                </div>
                <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <div className="card-body">
                        <Form method="post">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Nueva contraseña</span>
                                </label>
                                <input type="password" placeholder="********" name="password" className="input input-bordered" />
                                <FormError error={actionData?.fieldErrors?.password} />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Repite contraseña</span>
                                </label>
                                <input type="password" placeholder="********" name="confirmPassword" className="input input-bordered" />
                                <FormError error={actionData?.fieldErrors?.confirmPassword} />
                            </div>
                            <div className="form-control mt-6">
                                <button type="submit" disabled={state === 'submitting'} className="btn btn-primary">Restablecer</button>
                            </div>
                            <FormError error={actionData?.formError} />
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}