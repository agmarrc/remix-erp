import type { Catalogue, CataloguePermission } from "@prisma/client";
import { Form } from "@remix-run/react";
import FormError from "./FormError";

interface Props {
    actionData: {
        fieldErrors: null;
        fields: null;
        formError: string;
    } | undefined;
    permissions: CataloguePermission[],
    resources: Catalogue[]
}

export default function CataloguePermissions({ actionData, permissions, resources }: Props) {
    return (
        <div>
            <div className="flex items-center gap-5">
                <h4>Catálogos</h4>
                <label htmlFor="newCataloguePermissionModal" className="btn btn-sm">Nuevo permiso</label>
            </div>
            {permissions.length === 0
                ? <p>Sin permisos</p>
                : permissions.map((permission) => <p key={permission.id}>{JSON.stringify(permission)}</p>)}

            <input type="checkbox" id="newCataloguePermissionModal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <Form method="post">
                        <h3 className="font-bold text-lg">Nuevo permiso de catálogo</h3>
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
                        <input type="hidden" name="permission" value="catalogue" />
                        <div className="modal-action">
                            <label htmlFor="newCataloguePermissionModal" className="btn">Cerrar</label>
                            <button className="btn btn-primary">Guardar</button>
                        </div>
                        <FormError error={actionData?.formError} />
                    </Form>
                </div>
            </div>
        </div>
    );
}