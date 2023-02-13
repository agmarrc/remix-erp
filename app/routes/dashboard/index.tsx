import { json, LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import CardContainer from "~/components/Cards/CardContainer";
import CatalogueCard from "~/components/Cards/CatalogueCard";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await requireUserId(request);

    const catalogues = await db.catalogue.findMany({
        include: {
            _count: {
                select: { companies: true, locations: true, modules: true }
            }
        }
    });
    const createPermission = await db.cataloguePermission.findFirst({
        where: { userId: userId, create: true }
    });

    const canCreate = createPermission ? true : false;

    return json({ catalogues, canCreate });
};

export default function DashboardIndex() {
    const { catalogues, canCreate } = useLoaderData<typeof loader>();

    return <div className="mt-10">
        <div className="flex w-100 justify-between">
            <h2 className="text-xl">Catálogos</h2>
            {
                canCreate &&
                <Link to="/dashboard/catalogues/new" className="btn btn-primary">Nuevo catálogo</Link>
            }
        </div>

        {catalogues.length === 0
            ? <h3>Aún no hay catálogos.</h3>
            : <CardContainer>
                {catalogues.map((catalogue) => <CatalogueCard catalogue={catalogue} key={catalogue.id} />)}
            </CardContainer>
        }

    </div>
}