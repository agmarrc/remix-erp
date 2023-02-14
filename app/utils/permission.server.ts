import { db } from "./db.server";

interface PermissionProps {
    resource: string;
    query: { [key: string]: any }
}

export async function hasPermission({ resource, query }: PermissionProps) {
    switch (resource) {
        case 'company': {
            const permission = await db.companyPermission.findFirst({
                where: query
            });
            if (!permission) return false;
            return true;
        }
        case 'catalogue': {
            const permission = await db.cataloguePermission.findFirst({
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