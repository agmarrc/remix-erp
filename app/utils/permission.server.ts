import { db } from "./db.server";

interface PermissionProps {
    resource: string;
    query: {
        catalogueId?: string;
        companyId?: string;
        locationId?: string;
        moduleId?: string;
        userId: string;
        create?: boolean;
        edit?: boolean;
        destroy?: boolean;
    }
}

export async function hasPermission({ resource, query }: PermissionProps) {

    const { userId } = query;

    const user = await db.user.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    if (!user) return false;

    if (user.role.privileges === 1) return true;

    switch (resource) {
        case 'catalogue': {
            const permission = await db.cataloguePermission.findFirst({
                where: query
            });
            if (!permission) return false;
            return true;
        }
        case 'company': {
            const permission = await db.companyPermission.findFirst({
                where: query
            });
            if (!permission) return false;
            return true;
        }
        case 'location': {
            const permission = await db.locationPermission.findFirst({
                where: query
            });
            if (!permission) return false;
            return true;
        }
        case 'module': {
            const permission = await db.modulePermission.findFirst({
                where: query
            });
            if (!permission) return false;
            return true;
        }
        default: {
            return false;
        }
    }
}