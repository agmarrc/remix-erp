import type { Location, LocationPermission } from "@prisma/client";
import { Form } from "@remix-run/react";
import FormError from "../FormError";

type Permission = LocationPermission & {
    location: Location;
};

interface Props {
    actionData: {
        fieldErrors: null;
        fields: null;
        formError: string;
    } | undefined;
    permissions: Permission[],
    resources: Location[]
}

interface PermissionProps {
    permission: Permission;
}

function PermissionDetail({ permission }: PermissionProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 my-2">
            <span className="text-xl">{permission.location.name}</span>
            <div className={`badge ${permission.create && 'badge-accent'}`}>Crear</div>
            <div className={`badge ${permission.edit && 'badge-accent'}`}>Editar</div>
            <div className={`badge ${permission.destroy && 'badge-accent'}`}>Eliminar</div>
        </div>
    )
}

export default function LocationPermissions({ actionData, permissions, resources }: Props) {
    return (
        <div>
            <div className="flex items-center justify-between">
                <h4 className="text-xl">Sedes</h4>
                <label htmlFor="newLocationPermissionModal" className="btn btn-sm">Gestionar permiso</label>
            </div>
            {permissions.length === 0
                ? <p>Sin permisos</p>
                : permissions.map((permission) => <PermissionDetail key={permission.id} permission={permission} />)}

            <input type="checkbox" id="newLocationPermissionModal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <Form method="post">
                        <h3 className="font-bold text-lg">Gestionar permiso de sede</h3>
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
                        <input type="hidden" name="permission" value="location" />
                        <div className="modal-action">
                            <label htmlFor="newLocationPermissionModal" className="btn">Cerrar</label>
                            <button className="btn btn-primary">Guardar</button>
                        </div>
                        <FormError error={actionData?.formError} />
                    </Form>
                </div>
            </div>
        </div>
    );
}