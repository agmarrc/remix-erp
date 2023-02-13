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
                <h2 className="card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>

                    {company.name}
                </h2>
                <p><strong>Sedes:</strong> {company._count.locations}</p>
                <div className="card-actions justify-end">
                    <Link to={`/dashboard/companies/show/${company.id}`} className="btn btn-primary">Ver</Link>
                </div>
            </div>
        </div>
    );
}