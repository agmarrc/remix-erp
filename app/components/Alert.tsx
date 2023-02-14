import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
    type: string;
}

export default function Alert({ children, type }: Props) {
    return (
        <div>
            <div className={`alert m-6 ${type}  shadow-lg`}>
                <div>
                    <span>{children}</span>
                </div>
            </div>
            <div className="mt-10">
                <Link to="/dashboard" className="btn btn-primary">
                    Volver
                </Link>
            </div>
        </div>
    );
}