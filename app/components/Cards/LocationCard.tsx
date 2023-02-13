import type { Location } from "@prisma/client";
import { Link } from "@remix-run/react";
import LocationMap from "../LocationMap";

interface Props {
    location: Location & {
        _count: {
            modules: number;
        };
    };
}

export default function LocationCard({ location }: Props) {
    return (
        <div className="card w-full card-compact bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {location.name}
                </h2>
                <p><strong>{location.placeName}</strong></p>
                <p><strong>Módulos:</strong> {location._count.modules}</p>
                <div className="h-80">
                    <LocationMap latitude={parseFloat(location.latitude)} longitude={parseFloat(location.longitude)} />
                </div>
                <div className="card-actions justify-end">
                    <Link to={`/dashboard/locations/show/${location.id}`} className="btn btn-primary">Ver</Link>
                </div>
            </div>
        </div>
    );
}