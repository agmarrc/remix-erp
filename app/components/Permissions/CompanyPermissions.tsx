import type { Company, CompanyPermission } from "@prisma/client";
import { Form } from "@remix-run/react";
import FormError from "../FormError";

type Permission = CompanyPermission & {
    company: Company;
};

interface Props {
    actionData: {
        fieldErrors: null;
        fields: null;
        formError: string;
    } | undefined;
    permissions: Permission[],
    resources: Company[]
}

interface PermissionProps {
    permission: Permission
}

function PermissionDetail({ permission }: PermissionProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 my-2">
            <span className="text-xl">{permission.company.name}</span>
            <div className={`badge ${permission.create && 'badge-accent'}`}>Crear</div>
            <div className={`badge ${permission.edit && 'badge-accent'}`}>Editar</div>
            <div className={`badge ${permission.destroy && 'badge-accent'}`}>Eliminar</div>
        </div>
    )
}

export default function CompanyPermissions({ actionData, permissions, resources }: Props) {
    return (
        <div>
            <div className="flex items-center justify-between">
                <h4 className="text-xl">Empresas</h4>
                <label htmlFor="newCompanyPermissionModal" className="btn btn-sm">Gestionar permiso</label>
            </div>
            {permissions.length === 0
                ? <p>Sin permisos</p>
                : permissions.map((permission) => <PermissionDetail key={permission.id} permission={permission} />)}

            <input type="checkbox" id="newCompanyPermissionModal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <Form method="post">
                        <h3 className="font-bold text-lg">Gestionar permiso de empresa</h3>
                        <div className="my-6">
                            <select name="resourceId" className="select w-full max-w-xs">
                                {resources.map((resource) => <option value={resource.id} key={resource.id}>{resource.name}</option>)}
                            </select>
                        </div>
                        <div className="my-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="create" className="checkbox" />
                                <span className="label-text">Crear</span>
                            </label>
                        </div>
                        <div className="my-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="edit" className="checkbox" />
                                <span className="label-text">Editar</span>
                            </label>
                        </div>
                        <div className="my-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="destroy" className="checkbox" />
                                <span className="label-text">Eliminar</span>
                            </label>
                        </div>
                        <input type="hidden" name="permission" value="company" />
                        <div className="modal-action">
                            <label htmlFor="newCompanyPermissionModal" className="btn">Cerrar</label>
                            <button className="btn btn-primary">Guardar</button>
                        </div>
                        <FormError error={actionData?.formError} />
                    </Form>
                </div>
            </div>
        </div>
    );
}