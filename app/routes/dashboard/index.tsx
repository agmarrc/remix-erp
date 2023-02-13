import type { LoaderArgs } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react";
import { getUser } from "~/utils/session.server"

export const loader = async ({ request }: LoaderArgs) => {
    const user = await getUser(request);

    return ({ user });
}

export default function DashboardIndex() {

    const { user } = useLoaderData<typeof loader>();

    return (
        <div className="mt-10">
            <div className="">
                <h2 className="text-xl">Bienvenido, {user?.name}</h2>
                <p>¿A qué quieres acceder hoy?</p>

                <div className="my-3 flex flex-col items-start gap-3">
                    <Link className="link link-accent" to="catalogues">Catálogos</Link>
                    <Link className="link link-accent" to="companies">Empresas</Link>
                    <Link className="link link-accent" to="locations">Sedes</Link>
                    <Link className="link link-accent" to="modules">Módulos</Link>
                </div>
            </div>
        </div>
    )
}