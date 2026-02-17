import bcrypt from "bcryptjs";
import { prisma } from "./utils/prisma";

async function main() {
	const hashPassword = await bcrypt.hash("admin123", 10);

	const admin = await prisma.user.upsert({
		where: { email: "admin@gmail.com" },
		update: {},
		create: {
			name: "superadmin",
			email: "admin@gmail.com",
			password: hashPassword,
		},
	});
	console.log({ admin });
	console.log("Seed data success");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
