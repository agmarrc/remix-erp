import type { Catalogue, Company, Location, Module } from "@prisma/client";
import { Link } from "@remix-run/react";

interface Props {
    catalogue: Catalogue & {
        _count: {
            companies: number;
            locations: number;
            modules: number;
        };
    };
}

export default function CatalogueCard({catalogue}: Props) {
    return (
        <div className="card w-full card-compact bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{catalogue.name}</h2>
                <p><strong>Empresas:</strong> {catalogue._count.companies}</p>
                <p><strong>Sedes:</strong> {catalogue._count.locations}</p>
                <p><strong>Módulos:</strong> {catalogue._count.modules}</p>
                <div className="card-actions justify-end">
                    <Link to={`/dashboard/catalogues/show/${catalogue.id}`} className="btn btn-primary">Ver</Link>
                </div>
            </div>
        </div>
    );
}