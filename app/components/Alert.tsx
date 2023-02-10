import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
    type: string;
}

export default function Alert({ children, type }: Props) {
    return (
        <div className={`alert m-6 ${type}  shadow-lg`}>
            <div>
                <span>{children}</span>
            </div>
        </div>
    );
}