import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.role.create({
        data: {
            privileges: 1,
            description: 'Administrador'
        }
    });

    await prisma.role.create({
        data: {
            privileges: 2,
            description: 'Usuario'
        }
    });

    await prisma.user.create({
        data: {
            email: 'admin@erp.com',
            name: 'Administrador',
            passwordHash: '$2a$10$mLy8BV/JnervJGi5YhWUxuFdqGGUYe9ou9WjM9k/EqVpapJ1tWlUy',
            roleId: admin.id
        }
    });

    const catalogue = await prisma.catalogue.create({
        data: {
            name: 'Catalogo inicial',
        }
    });

    const company = await prisma.company.create({
        data: {
            name: 'Finexitus',
            catalogueId: catalogue.id
        }
    });

    const location = await prisma.location.create({
        data: {
            name: 'Guadalajara',
            placeName: 'Av. de las Américas 1254, Country Club, 44610 Guadalajara, Jal.',
            longitude: '-103.37289860221078',
            latitude: '20.697906368092923',
            companyId: company.id,
            catalogueId: company.catalogueId
        }
    });

    await prisma.module.create({
        data: {
            name: 'Tecnología',
            workers: 5,
            locationId: location.id,
            catalogueId: location.catalogueId
        }
    });

    await prisma.module.create({
        data: {
            name: 'Administración',
            workers: 4,
            locationId: location.id,
            catalogueId: location.catalogueId
        }
    });

    await prisma.module.create({
        data: {
            name: 'RH',
            workers: 3,
            locationId: location.id,
            catalogueId: location.catalogueId
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