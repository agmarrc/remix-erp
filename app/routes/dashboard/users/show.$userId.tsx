import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import BackButton from "~/components/BackButton";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import CataloguePermissions from "~/components/CataloguePermissions";
import CompanyPermissions from "~/components/CompanyPermissions";
import LocationPermissions from "~/components/LocationPermissions";
import ModulePermissions from "~/components/ModulePermissions";

export const loader = async ({ params }: LoaderArgs) => {
    const user = await db.user.findUnique({
        where: { id: params.userId },
        select: {
            name: true,
            email: true,
            id: true,
            role: true,
            cataloguePermissions: true,
            companyPermissions: true,
            locationPermissions: true,
            modulePermissions: true,
        }
    });

    if (!user) throw new Response("No se encontró el usuario", {
        status: 404
    });

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
            return redirect(`/dashboard/users/show/${params.userId}`);
        }
        case 'company': {
            await db.companyPermission.deleteMany({
                where: { userId: params.userId, companyId: resourceId }
            });
            await db.companyPermission.create({
                data: { companyId: resourceId, userId: params.userId, create: create, edit: edit, destroy: destroy }
            });
            return redirect(`/dashboard/users/show/${params.userId}`);
        }
        case 'location': {
            await db.locationPermission.deleteMany({
                where: { userId: params.userId, locationId: resourceId }
            });
            await db.locationPermission.create({
                data: { locationId: resourceId, userId: params.userId, create: create, edit: edit, destroy: destroy }
            });
            return redirect(`/dashboard/users/show/${params.userId}`);
        }
        case 'module': {
            await db.modulePermission.deleteMany({
                where: { userId: params.userId, moduleId: resourceId }
            });
            await db.modulePermission.create({
                data: { moduleId: resourceId, userId: params.userId, create: create, edit: edit, destroy: destroy }
            });
            return redirect(`/dashboard/users/show/${params.userId}`);
        }
        default: {
            throw new Response("Sin candidatos");
        }
    }
}

export default function ShowUser() {
    const { user, catalogues, companies, locations, modules } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    const { cataloguePermissions, companyPermissions, locationPermissions, modulePermissions } = user;

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

                <CataloguePermissions actionData={actionData} permissions={cataloguePermissions} resources={catalogues} />

                <CompanyPermissions actionData={actionData} permissions={companyPermissions} resources={companies} />

                <LocationPermissions actionData={actionData} permissions={locationPermissions} resources={locations} />

                <ModulePermissions actionData={actionData} permissions={modulePermissions} resources={modules} />
            </div>
        </>
    );
}