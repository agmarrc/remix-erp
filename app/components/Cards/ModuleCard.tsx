import type { Module } from "@prisma/client";
import { Link } from "@remix-run/react";

interface Props {
    module: Module;
}

export default function ModuleCard({ module }: Props) {
    return (
        <div className="card w-full card-compact bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                    {module.name}
                </h2>
                <div className="card-actions justify-end">
                    <Link to={`/dashboard/modules/show/${module.id}`} className="btn btn-primary">Ver</Link>
                </div>
            </div>
        </div>
    );
}