import type { Company } from "@prisma/client";
import { Link } from "@remix-run/react";

interface Props {
    company: Company & {
        _count: {
            locations: number;
        };
    };
}

export default function CompanyCard({ company }: Props) {
    return (
        <div className="card w-full card-compact bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{company.name}</h2>
                <p><strong>Sedes:</strong> {company._count.locations}</p>
                <div className="card-actions justify-end">
                    <Link to={`/dashboard/companies/show/${company.id}`} className="btn btn-primary">Ver</Link>
                </div>
            </div>
        </div>
    );
}