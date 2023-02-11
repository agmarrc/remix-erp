import type { ActionArgs, LoaderArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData, useParams } from "@remix-run/react";
import Alert from "~/components/Alert";
import BackButton from "~/components/BackButton";
import CardContainer from "~/components/CardContainer";
import { db } from "~/utils/db.server";

export const loader = async ({ params }: LoaderArgs) => {
    const module = await db.module.findUnique({
        where: { id: params.moduleId },
    });

    if (!module) {
        throw new Response('No se encontró el módulo', {
            status: 404
        });
    }

    return json({ module });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();
    if (form.get('intent') !== 'delete') return null;

    const module = await db.module.findUnique({
        where: { id: params.moduleId }
    });

    if (!module) throw new Response("Este recurso no existe", {
        status: 404
    });

    await db.module.delete({ where: { id: params.moduleId } });
    return redirect("/dashboard/modules");
}

export default function ShowModule() {
    const { module } = useLoaderData<typeof loader>();

    return (
        <>
            <BackButton uri="/dashboard/modules" />
            <CardContainer>
                <div className="card w-full card-compact bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">{module.name}</h2>
                        <div className="card-actions justify-end">
                            <Link to={`/dashboard/modules/edit/${module.id}`} className="btn btn-primary">Editar</Link>
                            <Form method="post">
                                <button className="btn btn-secondary" name="intent" value="delete">Eliminar</button>
                            </Form>
                        </div>
                    </div>
                </div>
            </CardContainer>
        </>
    )
}

export function CatchBoundary() {
    const caught = useCatch();

    switch (caught.status) {
        case 404: {
            return <Alert type="alert-error">{caught.data}</Alert>
        }
        default: {
            throw new Error(`Unhandled error: ${caught.status}`);
        }
    }
}

export function ErrorBoundary() {
    const { locationId } = useParams();

    return (
        <Alert type="alert-error">Ocurrió un error procesando la sede con id {locationId}</Alert>
    )
}