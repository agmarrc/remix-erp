import type { Catalogue } from "@prisma/client";
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

export default function CatalogueCard({ catalogue }: Props) {
    return (
        <div className="card w-full card-compact bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    {catalogue.name}
                </h2>
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