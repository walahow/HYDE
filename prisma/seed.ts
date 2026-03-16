import { PrismaClient, Role, DocumentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up database...");
  await prisma.statusLog.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.file.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding data...");

  // 1. Create Admins (Destinations)
  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminData = [
    {
      autoId: 101,
      nim: "ADM-001",
      name: "Admin LPPM",
      password: hashedPassword,
      role: Role.ADMIN,
      destinationName: "Lembaga Penelitian dan Pengabdian",
      categoryCode: "LPPM-01",
      acceptedDocuments: ["Proposal Penelitian", "Laporan Akhir Pengabdian"],
      isOpen: true,
    },
    {
      autoId: 102,
      nim: "ADM-002",
      name: "Admin TU Komputer",
      password: hashedPassword,
      role: Role.ADMIN,
      destinationName: "Tata Usaha Ilmu Komputer",
      categoryCode: "TU-KOM-02",
      acceptedDocuments: ["Surat Keterangan Aktif", "Transkrip Sementara"],
      isOpen: true,
    },
    {
      autoId: 103,
      nim: "ADM-003",
      name: "Admin Dekanat MIPA",
      password: hashedPassword,
      role: Role.ADMIN,
      destinationName: "Dekanat Fakultas MIPA",
      categoryCode: "DEK-MIPA-03",
      acceptedDocuments: ["Pengajuan Beasiswa", "Surat Izin PKL"],
      isOpen: false,
    },
  ];

  const admins = [];
  for (const data of adminData) {
    const admin = await prisma.user.create({ data });
    admins.push(admin);
  }
  console.log(`Seeded ${admins.length} admins.`);

  // 2. Create Students
  const studentData = [
    {
      autoId: 201,
      nim: "H1101221001",
      name: "Ahmad Fauzan",
      password: hashedPassword,
      role: Role.STUDENT,
    },
    {
      autoId: 202,
      nim: "H1101221042",
      name: "Siti Rahmawati",
      password: hashedPassword,
      role: Role.STUDENT,
    },
  ];

  const students = [];
  for (const data of studentData) {
    const student = await prisma.user.create({ data });
    students.push(student);
  }
  console.log(`Seeded ${students.length} students.`);

  // 3. Create Transactions
  const transactions = [];

  // Transaction 1: DRAFT
  const t1 = await prisma.transaction.create({
    data: {
      documentType: "Proposal Penelitian Mandiri",
      status: DocumentStatus.DRAFT,
      studentId: students[0].id,
      adminId: admins[0].id,
    },
  });
  transactions.push(t1);

  // Transaction 2: REVIEWING
  const t2 = await prisma.transaction.create({
    data: {
      documentType: "Transkrip Nilai Sementara",
      status: DocumentStatus.REVIEWING,
      studentId: students[1].id,
      adminId: admins[1].id,
    },
  });
  transactions.push(t2);

  // Transaction 3: REVISION
  const t3 = await prisma.transaction.create({
    data: {
      documentType: "Surat Keterangan Aktif",
      status: DocumentStatus.REVISION,
      studentId: students[0].id,
      adminId: admins[1].id,
    },
  });
  transactions.push(t3);

  console.log(`Seeded ${transactions.length} transactions.`);

  // 4. Create Files
  await prisma.file.create({
    data: {
      transactionId: t1.id,
      fileUrl: "https://example.blob.vercel-storage.com/proposal-v1.pdf",
      originalFileName: "Proposal_Fauzan.pdf",
      uploadedById: students[0].id,
    },
  });

  await prisma.file.create({
    data: {
      transactionId: t2.id,
      fileUrl: "https://example.blob.vercel-storage.com/transkrip-siti.pdf",
      originalFileName: "Transkrip_Siti.pdf",
      uploadedById: students[1].id,
    },
  });

  console.log("Seeded files.");

  // 5. Create StatusLogs
  await prisma.statusLog.create({
    data: {
      transactionId: t1.id,
      changedById: students[0].id,
      fromStatus: null,
      toStatus: DocumentStatus.DRAFT,
      note: "Initial submission.",
    },
  });

  await prisma.statusLog.create({
    data: {
      transactionId: t2.id,
      changedById: admins[1].id,
      fromStatus: DocumentStatus.DRAFT,
      toStatus: DocumentStatus.REVIEWING,
      note: "Admin is reviewing the transcript.",
    },
  });

  console.log("Seeded status logs.");

  // 6. Create Messages
  await prisma.message.create({
    data: {
      transactionId: t3.id,
      senderId: admins[1].id,
      senderRole: Role.ADMIN,
      content: "Please update your NIM in the footer.",
    },
  });

  console.log("Seeded messages.");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
