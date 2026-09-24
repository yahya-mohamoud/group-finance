import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Clear existing data safely
  await prisma.session.deleteMany({});
  await prisma.loginAttempt.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.person.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log("Cleared existing records.");

  // Create default Admin account with PIN 1234
  const defaultPin = "1234";
  const pinHash = await argon2.hash(defaultPin, { type: argon2.argon2id });
  await prisma.admin.create({
    data: {
      pinHash,
    },
  });
  console.log(`Initialized Admin account with default 4-digit PIN: ${defaultPin}`);

  // Create People
  const person1 = await prisma.person.create({
    data: {
      name: "Ahmed Hassan",
      phone: "+251 91 123 4567",
      monthlyFee: 1000,
      active: true,
    },
  });

  const person2 = await prisma.person.create({
    data: {
      name: "Mohamed Ibrahim",
      phone: "+251 92 234 5678",
      monthlyFee: 1000,
      active: true,
    },
  });

  const person3 = await prisma.person.create({
    data: {
      name: "Ali Omar",
      phone: "+251 93 345 6789",
      monthlyFee: 800,
      active: true,
    },
  });

  const person4 = await prisma.person.create({
    data: {
      name: "Fatima Zahra",
      phone: "+251 94 456 7890",
      monthlyFee: 1200,
      active: true,
    },
  });

  const person5 = await prisma.person.create({
    data: {
      name: "Aisha Yusuf",
      phone: "+251 95 567 8901",
      monthlyFee: 600,
      active: true,
    },
  });

  const person6 = await prisma.person.create({
    data: {
      name: "Bilal Tesfaye",
      phone: "+251 96 678 9012",
      monthlyFee: 600,
      active: true,
    },
  });

  // An inactive member who left the group
  const person7 = await prisma.person.create({
    data: {
      name: "Dawit Haile (Inactive)",
      phone: "+251 97 789 0123",
      monthlyFee: 500,
      active: false,
    },
  });

  console.log("Created 7 people (6 active, 1 inactive).");

  // Determine current month & year (defaulting to September 2026 or dynamic)
  const currentYear = 2026;
  const currentMonth = 9; // September
  const prevMonth = 8;    // August

  // Seed Previous Month (August 2026) payments
  await prisma.payment.createMany({
    data: [
      {
        personId: person1.id,
        year: currentYear,
        month: prevMonth,
        amount: 1000,
        paidAt: new Date(currentYear, prevMonth - 1, 5),
      },
      {
        personId: person2.id,
        year: currentYear,
        month: prevMonth,
        amount: 1000,
        paidAt: new Date(currentYear, prevMonth - 1, 8),
      },
      {
        personId: person3.id,
        year: currentYear,
        month: prevMonth,
        amount: 800,
        paidAt: new Date(currentYear, prevMonth - 1, 10),
      },
      {
        personId: person4.id,
        year: currentYear,
        month: prevMonth,
        amount: 1200,
        paidAt: new Date(currentYear, prevMonth - 1, 12),
      },
      {
        personId: person5.id,
        year: currentYear,
        month: prevMonth,
        amount: 600,
        paidAt: new Date(currentYear, prevMonth - 1, 15),
      },
      // Note: Dawit was active earlier and paid in August
      {
        personId: person7.id,
        year: currentYear,
        month: prevMonth,
        amount: 500,
        paidAt: new Date(currentYear, prevMonth - 1, 4),
      },
    ],
  });

  // Seed Current Month (September 2026) payments
  await prisma.payment.createMany({
    data: [
      {
        personId: person1.id,
        year: currentYear,
        month: currentMonth,
        amount: 1000, // Full
        paidAt: new Date(currentYear, currentMonth - 1, 3),
      },
      {
        personId: person3.id,
        year: currentYear,
        month: currentMonth,
        amount: 500, // Partial (Expected 800)
        paidAt: new Date(currentYear, currentMonth - 1, 10),
      },
      {
        personId: person4.id,
        year: currentYear,
        month: currentMonth,
        amount: 1200, // Full
        paidAt: new Date(currentYear, currentMonth - 1, 11),
      },
      {
        personId: person5.id,
        year: currentYear,
        month: currentMonth,
        amount: 600, // Full
        paidAt: new Date(currentYear, currentMonth - 1, 14),
      },
      // person2 (Mohamed) and person6 (Bilal) are NOT paid for September
    ],
  });

  console.log("Seeded payments for August and September 2026.");

  // Seed Expenses
  await prisma.expense.createMany({
    data: [
      // August expenses
      {
        description: "Meeting hall rental (August)",
        amount: 400,
        date: new Date(currentYear, prevMonth - 1, 1),
      },
      {
        description: "Stationery & printing",
        amount: 150,
        date: new Date(currentYear, prevMonth - 1, 14),
      },
      // September expenses
      {
        description: "Electricity & Utility bill",
        amount: 250,
        date: new Date(currentYear, currentMonth - 1, 4),
      },
      {
        description: "Meeting hall rental (September)",
        amount: 400,
        date: new Date(currentYear, currentMonth - 1, 7),
      },
      {
        description: "Office supplies & tea refreshments",
        amount: 150,
        date: new Date(currentYear, currentMonth - 1, 18),
      },
    ],
  });

  console.log("Seeded expenses.");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
