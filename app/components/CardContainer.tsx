import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function CardContainer({children}: Props) {
    return (
        <div className="my-6 mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 place-items-center gap-4 w-full">
            {children}
        </div>
    );
}