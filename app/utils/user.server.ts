import bcrypt from 'bcrypt';
import { db } from './db.server';

export async function updatePassword(password: string, userId: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.update({
        where: { id: userId },
        data: { passwordHash: passwordHash }
    });
}