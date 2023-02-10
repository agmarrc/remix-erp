import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import CardContainer from "~/components/CardContainer";
import { db } from "~/utils/db.server";

export const loader = async () => {
    const catalogues = await db.catalogue.findMany()
    return json({ catalogues });
};

export default function Catalogues() {
    const { catalogues } = useLoaderData<typeof loader>();

    return <div className="mt-10">
        <div className="flex w-100 justify-between">
            <h2 className="text-xl">Mis catálogos</h2>
            <Link to="new" className="btn btn-primary">Nuevo catálogo</Link>
        </div>

        <Outlet />

        {catalogues.length === 0
            ? <h3>Aún no hay catálogos.</h3>
            : <CardContainer>
                {catalogues.map((catalogue) => <h1 key={catalogue.id}>{catalogue.name}</h1>)}
            </CardContainer>
        }

    </div>
}