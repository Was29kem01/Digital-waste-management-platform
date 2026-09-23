const { spawn } = require('child_process');
const consent = "Ok you can bypass all data present in the task database but also change the name (e.g from task to something like wasteBase) and create all the tables, and do all what's necessary to finish with the database so that i can view all informations inside later. In the .env change also the database name to wasteBase. I have access to both postgres 15 and 18 so i'll see all changes later";

console.log("Starting prisma db push...");

const child = spawn('npx.cmd', ['prisma', 'db', 'push', '--accept-data-loss', '--force-reset'], {
  env: {
    ...process.env,
    PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: consent
  }
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  if (output.includes('Do you want to create it?')) {
    console.log("Sending 'y' to prompt...");
    child.stdin.write('y\n');
  }
  if (output.includes('Are you sure you want to drop')) {
    child.stdin.write('y\n');
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});
