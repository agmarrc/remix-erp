import { json, LoaderArgs, redirect } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import { getUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await getUserId(request);
    if (!userId) {
        return redirect('/auth/login');
    }
    return json({});
};

export default function Dashboard() {
    return <>
        <Navbar />
        <div className="container mx-auto">
            <h1 className="text-2xl">Dashboard</h1>
            <div className="tabs mt-10">
                <Link to="companies" className="tab tab-lifted">Empresas</Link>
                <Link to="campus" className="tab tab-lifted">Sedes</Link>
            </div>
            <div className="mx-2">
            <Outlet />
            </div>
        </div>
    </>
}