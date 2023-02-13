import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import UsersTable from "~/components/UsersTable";
import { db } from "~/utils/db.server";

export const loader = async () => {
    const users = await db.user.findMany({
        select: { email: true, id: true, name: true, role: true },
    });

    return json({ users });
}

export default function UsersIndex() {
    const { users } = useLoaderData<typeof loader>();

    return <div className="mt-10">
        <div className="flex w-100 justify-between">
            <h2 className="text-xl">Usuarios</h2>
            <Link to="/dashboard/users/new" className="btn btn-primary">Nuevo usuario</Link>
        </div>

        <div className="mt-10">
        <UsersTable users={users} />
        </div>
    </div>
}