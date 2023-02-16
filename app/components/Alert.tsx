import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
    type: string;
    backButton?: boolean;
}

export default function Alert({ children, type, backButton = true }: Props) {
    return (
        <div className="w-3/4">
            <div className={`alert m-6 ${type}  shadow-lg`}>
                <div>
                    <span>{children}</span>
                </div>
            </div>
            {
                backButton &&
                <div className="mt-10">
                    <Link to="/dashboard" className="btn btn-primary">
                        Volver
                    </Link>
                </div>
            }
        </div>
    );
}