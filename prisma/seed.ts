import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.role.create({
        data: {
            privileges: 1,
            description: 'Rol de administrador'
        }
    });

    await prisma.role.create({
        data: {
            privileges: 2,
            description: 'Rol de usuario'
        }
    });

    await prisma.user.create({
        data: {
            email: 'admin@erp.com',
            name: 'Marco Garcia',
            passwordHash: '$2a$10$mLy8BV/JnervJGi5YhWUxuFdqGGUYe9ou9WjM9k/EqVpapJ1tWlUy',
            roleId: admin.id
        }
    });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1)
    });