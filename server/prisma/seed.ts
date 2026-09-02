import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Starting database seeding...");

  // 1. seed departments
  const departments = [
    { name: "Bachelor of Science in Information Technology", acronym: "BSIT" },
    { name: "Bachelor of Science in Computer Science", acronym: "BSCS" },
    { name: "Bachelor of Science in Social Work", acronym: "BSSW" },
    { name: "Bachelor of Early Childhood Education", acronym: "BECED" },
  ];

  for (const dept of departments) {
    const existing = await prisma.department.findFirst({
      where: { acronym: dept.acronym },
    });
    if (!existing) {
      await prisma.department.create({ data: dept });
      console.log(`  + created department: ${dept.acronym}`);
    }
  }

  // 2. seed year levels
  const yearLevels = ["1st year", "2nd year", "3rd year", "4th year"];
  for (const year of yearLevels) {
    const existing = await prisma.yearLevel.findFirst({
      where: { year },
    });
    if (!existing) {
      await prisma.yearLevel.create({ data: { year } });
      console.log(`  + created year level: ${year}`);
    }
  }

  // 3. seed academic years
  const academicYears = ["2026-2027"];
  for (const name of academicYears) {
    await prisma.academicYear.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  + verified academic year: ${name}`);
  }

  // 4. seed standard positions
  const positions = [
    { title: "President", maxVotes: 1, isGlobal: true },
    { title: "Vice President", maxVotes: 1, isGlobal: true },
    { title: "Senator", maxVotes: 8, isGlobal: true },
    { title: "Representative", maxVotes: 1, isGlobal: false },
  ];

  for (const pos of positions) {
    const existing = await prisma.position.findFirst({
      where: { title: pos.title },
    });
    if (!existing) {
      await prisma.position.create({ data: pos });
      console.log(`  + created position: ${pos.title}`);
    }
  }

  // 5. seed admin accounts
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "password123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const adminAccounts = [
    {
      email: "freetoken925@gmail.com",
      firstName: "Juan",
      lastName: "Tamad",
      role: "ELECTION_OFFICER" as const,
      password: hashedPassword,
    },
  ];

  for (const admin of adminAccounts) {
    const existing = await prisma.admin.findUnique({
      where: { email: admin.email },
    });

    if (!existing) {
      await prisma.admin.create({
        data: admin,
      });
      console.log(`  + created admin account: ${admin.email} (${admin.role})`);
    } else {
      console.log(`  = admin already exists: ${admin.email}`);
    }
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Database seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
