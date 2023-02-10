import { json, LoaderArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import CardContainer from "~/components/CardContainer";
import CompanyCard from "~/components/CompanyCard";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await requireUserId(request);
    const campus = await db.campus.findMany({
        where: { userId: userId }
    })
    return json({ campus });
};

export default function Companies() {
    const { campus } = useLoaderData<typeof loader>();

    return <div className="mt-10">
        <div className="flex w-100 justify-between">
            <h2 className="text-xl">Mis sedes</h2>
            <Link to="new" className="btn btn-primary">Nueva sede</Link>
        </div>

        <Outlet />

        {campus.length === 0
            ? <h3>Aún no hay sedes.</h3>
            : <CardContainer>
                {campus.map((item) => <h1 key={item.id}>{item.name}</h1>)}
            </CardContainer>
        }

    </div>
}