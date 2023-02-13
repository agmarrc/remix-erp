import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import { getUser, getUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
    const userId = await getUserId(request);
    if (!userId) {
        return redirect('/auth/login');
    }
    const user = await getUser(request);
    const isAdmin = user?.role.privileges === 1 ? true : false;
    return json({isAdmin});
};

export default function Dashboard() {
    const {isAdmin} = useLoaderData<typeof loader>();

    return <>
        <Navbar isAdmin={isAdmin} />
        <div className="container mx-auto mb-36">
            <h1 className="text-2xl">Dashboard</h1>
            <div className="mx-2">
                <Outlet />
            </div>
        </div>
    </>
}