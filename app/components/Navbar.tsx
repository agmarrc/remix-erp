import { Form, Link } from "@remix-run/react";
import { APP_TITLE } from "~/data/constants";

interface Props {
    isAdmin: boolean;
    name: string;
}

export default function Navbar({ isAdmin, name }: Props) {
    return (
        <div className="navbar bg-base-100">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </label>
                    <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <Link to="/dashboard">Inicio</Link>
                        </li>
                        {
                            isAdmin &&
                            <li>
                                <Link to="/dashboard/users">Usuarios</Link>
                            </li>
                        }
                        <li>
                            <Form action="/auth/logout" method="post">
                                <button type="submit">
                                    Cerrar sesión
                                </button>
                            </Form>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="navbar-center">
                <Link to="/dashboard" className="btn btn-ghost normal-case text-xl">{APP_TITLE}</Link>
            </div>
            <div className="navbar-end">
                <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm">{name}</p>
                </div>
            </div>
        </div>
    );
}