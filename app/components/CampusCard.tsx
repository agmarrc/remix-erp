import { Campus } from "@prisma/client";
import { Link } from "@remix-run/react";

interface Props {
    campus: Campus;
}

export default function CampusCard({campus}: Props) {
    return (
        <div className="card w-full card-compact bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{campus.name}</h2>
                <div className="card-actions justify-end">
                    <Link to={`/dashboard/campus/show/${campus.id}`} className="btn btn-primary">Ver</Link>
                </div>
            </div>
        </div>
    );
}