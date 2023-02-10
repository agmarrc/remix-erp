import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import CardContainer from "~/components/CardContainer";
import { db } from "~/utils/db.server";

export const loader = async () => {
    const locations = await db.location.findMany()
    return json({ locations });
};

export default function Locations() {
    const { locations } = useLoaderData<typeof loader>();

    return <div className="mt-10">
        <div className="flex w-100 justify-between">
            <h2 className="text-xl">Mis sedes</h2>
            <Link to="new" className="btn btn-primary">Nueva sede</Link>
        </div>

        <Outlet />

        {locations.length === 0
            ? <h3>Aún no hay sedes.</h3>
            : <CardContainer>
                {locations.map((location) => <h1 key={location.id}>{location.name}</h1>)}
            </CardContainer>
        }

    </div>
}