import type { ActionArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const action = async ({ params, request }: ActionArgs) => {
    const userAccess = await getUser(request);

    if (userAccess?.role.privileges !== 1) return redirect('/dashboard');

    const form = await request.formData();
    const permission = form.get('permission');
    const userId = form.get('userId');

    if (typeof permission !== 'string' || typeof userId !== 'string') return redirect('/dashboard');

    switch (permission) {
        case 'catalogue': {
            await db.cataloguePermission.delete({
                where: { id: params.permissionId }
            });
            break;
        }
        case 'company': {
            await db.companyPermission.delete({
                where: { id: params.permissionId }
            });
            break;
        }
        case 'location': {
            await db.locationPermission.delete({
                where: { id: params.permissionId }
            });
            break;
        }
        case 'module': {
            await db.modulePermission.delete({
                where: { id: params.permissionId }
            });
            break;
        }
    }

    return redirect(`/dashboard/users/show/${userId}`);
}