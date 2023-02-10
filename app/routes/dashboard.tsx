import type { LoaderArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import BottomNav from "~/components/BottomNav";
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
            <div className="mx-2">
                <Outlet />
            </div>
            <BottomNav />
        </div>
    </>
}