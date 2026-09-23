const prisma = require('./SRC/config/prisma');

async function check() {
  const reports = await prisma.report.findMany();
  console.log(JSON.stringify(reports, null, 2));
  process.exit(0);
}
check();
