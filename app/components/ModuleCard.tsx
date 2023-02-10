import type { Module } from "@prisma/client";
import { Link } from "@remix-run/react";

interface Props {
    module: Module;
}

export default function ModuleCard({module}: Props) {
    return (
        <div className="card w-full card-compact bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{module.name}</h2>
                <div className="card-actions justify-end">
                    <Link to={`/dashboard/modules/show/${module.id}`} className="btn btn-primary">Ver</Link>
                </div>
            </div>
        </div>
    );
}