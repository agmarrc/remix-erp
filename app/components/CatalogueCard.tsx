import { Catalogue } from "@prisma/client";
import { Link } from "@remix-run/react";

interface Props {
    catalogue: Catalogue;
}

export default function CatalogueCard({catalogue}: Props) {
    return (
        <div className="card w-full card-compact bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{catalogue.name}</h2>
                <div className="card-actions justify-end">
                    <Link to={`/dashboard/catalogues/show/${catalogue.id}`} className="btn btn-primary">Ver</Link>
                </div>
            </div>
        </div>
    );
}