import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useCatch, useLoaderData } from "@remix-run/react";
import BackButton from "~/components/BackButton";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import CataloguePermissions from "~/components/Permissions/CataloguePermissions";
import CompanyPermissions from "~/components/Permissions/CompanyPermissions";
import LocationPermissions from "~/components/Permissions/LocationPermissions";
import ModulePermissions from "~/components/Permissions/ModulePermissions";
import { getUser } from "~/utils/session.server";
import { ERROR_RESOURCE_NOT_FOUND, ERROR_UNEXPECTED } from "~/data/constants";
import Alert from "~/components/Alert";

export const loader = async ({ params, request }: LoaderArgs) => {
    const userAccess = await getUser(request);

    if (userAccess?.role.privileges !== 1) return redirect('/dashboard');

    const user = await db.user.findUnique({
        where: { id: params.userId },
        select: {
            name: true,
            email: true,
            id: true,
            role: true,
            cataloguePermissions: {
                include: {
                    catalogue: true
                }
            },
            companyPermissions: {
                include: {
                    company: true
                }
            },
            locationPermissions: {
                include: {
                    location: true
                }
            },
            modulePermissions: {
                include: {
                    module: true
                }
            },
        }
    });

    if (!user) throw new Response(ERROR_RESOURCE_NOT_FOUND, { status: 404 });

    const catalogues = await db.catalogue.findMany();
    const companies = await db.company.findMany();
    const locations = await db.location.findMany();
    const modules = await db.module.findMany();

    return json({ user, catalogues, companies, locations, modules });
}

export const action = async ({ params, request }: ActionArgs) => {
    const form = await request.formData();

    const create = Boolean(form.get('create'));
    const edit = Boolean(form.get('edit'));
    const destroy = Boolean(form.get('destroy'));
    const resourceId = form.get('resourceId');
    const permission = form.get('permission');

    if (
        typeof resourceId !== "string" ||
        typeof permission !== "string"
    ) {
        return badRequest({
            fieldErrors: null,
            fields: null,
            formError: `El formulario no se envió correctamente.`,
        });
    }

    if (!params.userId) {
        return redirect('/dashboard/users');
    }

    switch (permission) {
        case 'catalogue': {
            await db.cataloguePermission.deleteMany({
                where: { userId: params.userId, catalogueId: resourceId }
            });
            await db.cataloguePermission.create({
                data: { catalogueId: resourceId, userId: params.userId, create: create, edit: edit, destroy: destroy }
            });
            await db.cataloguePermission.updateMany({
                where: { userId: params.userId },
                data: { create }
            });
            break;
        }
        case 'company': {
            await db.companyPermission.deleteMany({
                where: { userId: params.userId, companyId: resourceId }
            });
            await db.companyPermission.create({
                data: { companyId: resourceId, userId: params.userId, create: create, edit: edit, destroy: destroy }
            });
            await db.companyPermission.updateMany({
                where: { userId: params.userId },
                data: { create }
            });
            break;
        }
        case 'location': {
            await db.locationPermission.deleteMany({
                where: { userId: params.userId, locationId: resourceId }
            });
            await db.locationPermission.create({
                data: { locationId: resourceId, userId: params.userId, create: create, edit: edit, destroy: destroy }
            });
            await db.locationPermission.updateMany({
                where: { userId: params.userId },
                data: { create }
            });
            break;
        }
        case 'module': {
            await db.modulePermission.deleteMany({
                where: { userId: params.userId, moduleId: resourceId }
            });
            await db.modulePermission.create({
                data: { moduleId: resourceId, userId: params.userId, create: create, edit: edit, destroy: destroy }
            });
            await db.modulePermission.updateMany({
                where: { userId: params.userId },
                data: { create }
            });
            break;
        }
    }
    return redirect(`/dashboard/users/show/${params.userId}`);
}

export default function ShowUser() {
    const { user, catalogues, companies, locations, modules } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    const { cataloguePermissions, companyPermissions, locationPermissions, modulePermissions } = user;

    if (user.role.privileges == 1) {
        return (
            <>
                <BackButton uri={`/dashboard/users`} />

                <div>
                    <h3 className="text-xl">{user.name}</h3>
                    <p>{user.email}</p>
                    <span className="badge">{user.role.description}</span>
                </div>

                <div className="my-6 flex flex-col gap-10">
                    <h3 className="text-xl">Permisos</h3>
                    <p>Dado que {user.name} es un usuario adminstrador, cuenta con todos los permisos.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <BackButton uri={`/dashboard/users`} />

            <div>
                <h3 className="text-xl">{user.name}</h3>
                <p>{user.email}</p>
                <span className="badge">{user.role.description}</span>
            </div>

            <div className="my-6 flex flex-col gap-20">
                <h3 className="text-xl">Permisos</h3>

                <CataloguePermissions actionData={actionData} permissions={cataloguePermissions} resources={catalogues} />

                <CompanyPermissions actionData={actionData} permissions={companyPermissions} resources={companies} />

                <LocationPermissions actionData={actionData} permissions={locationPermissions} resources={locations} />

                <ModulePermissions actionData={actionData} permissions={modulePermissions} resources={modules} />
            </div>
        </>
    );
}

export function CatchBoundary() {
    const caught = useCatch();

    switch (caught.status) {
        case 403: {
            return <Alert type="alert-error">{caught.data}</Alert>
        }
        case 404: {
            return <Alert type="alert-error">{caught.data}</Alert>
        }
        default: {
            throw new Error(`Unhandled error: ${caught.status}`);
        }
    }
}

export function ErrorBoundary() {
    return (
        <Alert type="alert-error">{ERROR_UNEXPECTED}</Alert>
    )
}