import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import CardContainer from "~/components/CardContainer";
import LocationCard from "~/components/LocationCard";
import { db } from "~/utils/db.server";

export const loader = async () => {
    const locations = await db.location.findMany({
        include: {
            _count: {
                select: { modules: true }
            }
        }
    })
    return json({ locations });
};

export default function Locations() {
    const { locations } = useLoaderData<typeof loader>();

    return <div className="mt-10">
        <div className="flex w-100 justify-between">
            <h2 className="text-xl">Sedes</h2>
            <Link to="new" className="btn btn-primary">Nueva sede</Link>
        </div>

        <Outlet />

        {locations.length === 0
            ? <h3>Aún no hay sedes.</h3>
            : <CardContainer>
                {locations.map((location) => <LocationCard location={location} key={location.id} />)}
            </CardContainer>
        }

    </div>
}