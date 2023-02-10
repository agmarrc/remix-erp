import { json, LoaderArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import CardContainer from "~/components/CardContainer";
import CompanyCard from "~/components/CompanyCard";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
    const companies = await db.company.findMany()
    return json({ companies });
};

export default function Companies() {
    const { companies } = useLoaderData<typeof loader>();

    return <div className="mt-10">
        <div className="flex w-100 justify-between">
            <h2 className="text-xl">Mis empresas</h2>
            <Link to="new" className="btn btn-primary">Nueva empresa</Link>
        </div>

        <Outlet />

        {companies.length === 0
            ? <h3>Aún no hay empresas.</h3>
            : <CardContainer>
                {companies.map((company) => <CompanyCard company={company} key={company.id} />)}
            </CardContainer>
        }

    </div>
}