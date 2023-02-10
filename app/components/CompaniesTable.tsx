import { Company } from "@prisma/client";

interface Props {
    companies: Company[]
}

export default function CompaniesTable({ companies }: Props) {
    return (
        <div className="relative overflow-x-auto my-6">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Empresa
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map((company) =>
                        <tr key={company.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {company.name}
                            </th>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}