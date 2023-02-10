import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import CardContainer from "~/components/CardContainer";
import ModuleCard from "~/components/ModuleCard";
import { db } from "~/utils/db.server";

export const loader = async () => {
    const modules = await db.module.findMany()
    return json({ modules });
};

export default function Modules() {
    const { modules } = useLoaderData<typeof loader>();

    return <div className="mt-10">
        <div className="flex w-100 justify-between">
            <h2 className="text-xl">Módulos</h2>
            <Link to="new" className="btn btn-primary">Nuevo módulo</Link>
        </div>

        <Outlet />

        {modules.length === 0
            ? <h3>Aún no hay módulos.</h3>
            : <CardContainer>
                {modules.map((module) => <ModuleCard module={module} key={module.id} />)}
            </CardContainer>
        }

    </div>
}