import type { ActionArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const action = async ({ params, request }: ActionArgs) => {
    const user = await getUser(request);

    if (user?.role.privileges !== 1) return redirect('/dashboard');

    await db.user.delete({
        where: { id: params.userId }
    });

    return redirect('/dashboard/users');
}