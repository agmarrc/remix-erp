import type { Role } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

interface Props {
    users: {
        email: string;
        id: string;
        name: string;
        role: Role;
    }[];
}

interface RowProps {
    user: {
        email: string;
        id: string;
        name: string;
        role: Role;
    }
}

export default function UsersTable({ users }: Props) {
    return (
        <div className="overflow-x-auto w-full">
            <table className="table w-full">
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map((user) => <TableRow user={user} key={user.id} />)
                    }

                </tbody>
            </table>
        </div>
    );
}

function TableRow({ user }: RowProps) {
    return (
        <tr>
            <td>
                <div className="flex items-center space-x-3">
                    <div>
                        <div className="font-bold">{user.name}</div>
                        <div className="text-sm opacity-50">{user.email}</div>
                    </div>
                </div>
            </td>
            <td>
                <span className="badge badge-ghost badge-sm">{user.role.description}</span>
            </td>
            <th>
                <Link to={`/dashboard/users/show/${user.id}`} className="btn btn-ghost btn-xs">
                    Permisos
                </Link>
            </th>
            <th>
                <Link to={`/dashboard/users/edit/${user.id}`} className="btn btn-ghost btn-xs">
                    Editar
                </Link>
            </th>
            <th>
                <Form action={`/dashboard/users/delete/${user.id}`} method='post'>
                    <button className="btn btn-ghost btn-xs">Eliminar</button>
                </Form>
            </th>
        </tr>
    );
}