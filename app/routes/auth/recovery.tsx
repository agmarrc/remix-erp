import type { ActionArgs } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { redirect } from "react-router";
import FormError from "~/components/FormError";
import { db } from "~/utils/db.server";
import { sendRecoveryEmail } from "~/utils/email.server";
import { badRequest } from "~/utils/request.server";

function validateEmail(email: unknown) {
    if (typeof email !== "string" || email.length < 3) {
        return `Ingresa un email valido`;
    }
}

export const action = async ({ request }: ActionArgs) => {
    const form = await request.formData();
    const email = form.get('email');

    if (
        typeof email !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió de forma correcta.`,
        });
    }

    const fields = { email };
    const fieldErrors = {
        email: validateEmail(email),
    };
    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({
            fieldErrors,
            fields,
            formError: null,
        });
    }

    const user = await db.user.findFirst({
        where: { email: email }
    });

    if (!user) {
        return badRequest({
            fieldErrors,
            fields,
            formError: "No se encontraron usuarios",
        });
    }

    await db.recovery.deleteMany({
        where: { userId: user.id }
    });

    const recovery = await db.recovery.create({
        data: { userId: user.id }
    });

    const recoveryUrl = `${process.env.APP_URL}/auth/reset/${recovery.id}`;

    await sendRecoveryEmail(user.email, recoveryUrl);

    return redirect('/auth/recovery-sended');
}

export default function Recovery() {
    const actionData = useActionData<typeof action>();
    const { state } = useTransition();

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">Recupera tu cuenta</h1>
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
                            <div className="form-control mt-6">
                                <button type="submit" disabled={state === 'submitting'} className="btn btn-primary">Enviar</button>
                            </div>
                            <FormError error={actionData?.formError} />
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    )
}