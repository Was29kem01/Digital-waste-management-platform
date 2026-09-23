const { Role, ReportStatus, PriorityLevel } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = require('../SRC/config/prisma');

async function main() {
  console.log('Start seeding all roles and data...');
  
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Branches
  const branchCentral = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Yaoundé Central', zone: 'Zone 1' },
  });
  
  const branchNorth = await prisma.branch.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Yaoundé North', zone: 'Zone 2' },
  });

  // 2. Create Users for EVERY Role
  // Super Admin
  await prisma.user.upsert({
    where: { email: 'superadmin@propre.com' },
    update: {},
    create: { email: 'superadmin@propre.com', name: 'Super Admin', password: defaultPassword, role: Role.SUPER_ADMIN },
  });

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@propre.com' },
    update: {},
    create: { email: 'admin@propre.com', name: 'System Admin', password: defaultPassword, role: Role.ADMIN },
  });

  // Station Admin (Central)
  const stationAdmin = await prisma.user.upsert({
    where: { email: 'stationadmin@propre.com' },
    update: {},
    create: { email: 'stationadmin@propre.com', name: 'Station Admin Central', password: defaultPassword, role: Role.STATION_ADMIN, branchId: branchCentral.id },
  });

  // Station Manager (Central)
  await prisma.user.upsert({
    where: { email: 'manager@propre.com' },
    update: {},
    create: { email: 'manager@propre.com', name: 'Manager Central', password: defaultPassword, role: Role.STATION_MANAGER, branchId: branchCentral.id },
  });

  // Field Agents (Central)
  const fieldAgent = await prisma.user.upsert({
    where: { email: 'agent@propre.com' },
    update: {},
    create: { email: 'agent@propre.com', name: 'Paul Biya', password: defaultPassword, role: Role.FIELD_AGENT, branchId: branchCentral.id },
  });

  const fieldAgent2 = await prisma.user.upsert({
    where: { email: 'agent2@propre.com' },
    update: {},
    create: { email: 'agent2@propre.com', name: 'Samuel Eto', password: defaultPassword, role: Role.FIELD_AGENT, branchId: branchCentral.id },
  });
  
  const fieldAgent3 = await prisma.user.upsert({
    where: { email: 'agent3@propre.com' },
    update: {},
    create: { email: 'agent3@propre.com', name: 'Francis Ngannou', password: defaultPassword, role: Role.FIELD_AGENT, branchId: branchCentral.id },
  });

  // Client (Citizen)
  const client = await prisma.user.upsert({
    where: { email: 'citizen@propre.com' },
    update: {},
    create: { email: 'citizen@propre.com', name: 'John Citizen', password: defaultPassword, role: Role.CLIENT },
  });

  // 3. Create Sample Reports
  console.log('Creating sample reports...');
  await prisma.report.create({
    data: {
      latitude: 3.8480,
      longitude: 11.5021,
      status: ReportStatus.PENDING,
      priority: PriorityLevel.NORMAL,
      submitterId: client.id,
      branchId: branchCentral.id,
    }
  });

  await prisma.report.create({
    data: {
      latitude: 3.8500,
      longitude: 11.5100,
      status: ReportStatus.VERIFIED,
      priority: PriorityLevel.HIGH,
      submitterId: client.id,
      branchId: branchCentral.id,
      assignedToId: fieldAgent.id
    }
  });

  console.log('Seeding finished successfully! All roles and sample reports have been created. Password for all users is: password123');
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
