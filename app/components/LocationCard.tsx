import type { Location } from "@prisma/client";
import { Link } from "@remix-run/react";

interface Props {
    location: Location & {
        _count: {
            modules: number;
        };
    };
}

export default function LocationCard({location}: Props) {
    return (
        <div className="card w-full card-compact bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{location.name}</h2>
                <p><strong>Módulos:</strong> {location._count.modules}</p>
                <div className="card-actions justify-end">
                    <Link to={`/dashboard/locations/show/${location.id}`} className="btn btn-primary">Ver</Link>
                </div>
            </div>
        </div>
    );
}