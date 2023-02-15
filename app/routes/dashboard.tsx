import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import Alert from "~/components/Alert";
import Navbar from "~/components/Navbar";
import { ERROR_UNEXPECTED } from "~/data/constants";
import { getUser, logout, requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
    await requireUserId(request);

    const user = await getUser(request);

    if (!user) return logout(request);

    const isAdmin = user.role.privileges === 1 ? true : false;
    return json({isAdmin, name: user.name});
};

export default function Dashboard() {
    const {isAdmin, name} = useLoaderData<typeof loader>();

    return <>
        <Navbar isAdmin={isAdmin} name={name} />
        <div className="container mx-auto mb-36">
            <h1 className="text-2xl">Dashboard</h1>
            <div className="mx-2">
                <Outlet />
            </div>
        </div>
    </>
}

export function ErrorBoundary() {
    return (
        <Alert type="alert-error">{ERROR_UNEXPECTED}</Alert>
    )
}