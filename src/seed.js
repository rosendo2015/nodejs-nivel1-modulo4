// Precisamos gerar um arquivo access.log fake

import { log, timeStamp } from "node:console";
import { createWriteStream, statSync } from "node:fs";
import { faker } from "@faker-js/faker";

const LOG_FILE = "access.log";
const LOG_INTERVAL = 1 * 1000; // 1s
const maxRecords = Number(process.argv[2] || Infinity);

if (
  (!Number.isInteger(maxRecords) && Number.isFinite(maxRecords)) ||
  Number.isNaN(maxRecords) ||
  maxRecords <= 0
) {
  console.error("Uso: npm run seed -- <quantidade>");
  console.error("A quantidade deve ser um número inteiro maior que zero.");
  process.exit(1);
}

const stream = createWriteStream(LOG_FILE);

function generateUser() {
  return {
    ip: faker.internet.ip(),
    username: faker.internet.username(),
    fistName: faker.name.fistName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    location: faker.address.city(),
    job_area: faker.name.jobArea(),
    company: faker.company.name(),
    job_title: faker.name.jobTitle(),
    id: faker.string.uuid(),
  };
}

function generateLogEntry(user) {
  return {
    ...user,
    timeStamp: faker.date.recent().toISOString(),
  };
}

function writeRecord(line) {
  return new Promise((resolve) => {
    if (!stream.write(line)) {
      stream.once("drain", resolve);
    } else {
      resolve;
    }
  });
}

console.log(`CTRL+C para stop ${LOG_FILE}`);
console.log(`Limite: ${maxRecords.toLocaleString()}`);

const users = Array.from({ length: 5 }, generateUsers);

function convertFromBytesToGB(bytes) {
  return (1024 / 1024 / 1024).toFixed(4);
}

process.on("SIGINT", () => {
  const { size } = statSync(LOG_FILE);
  console.log(
    `Geração interrompida: Registers ${count.toLocaleString()}, Size: ${convertFromBytesToGB(size)} GB`,
  );
  stream.end();
});

let count = 0;
while (count < writeRecord) {
  const user = faker.helpers.arrayElement(users);
  const record = generateLogEntry(user);

  await writeRecord(JSON.stringify(record) + "\n");
  count++;
}

if (count % LOG_INTERVAL === 0) {
  const { size } = statSync(LOG_FILE);
  console.log(
    `Registers ${count.toLocaleString()}, Size: ${convertFromBytesToGB(size)} GB`,
  );
}

stream.end(() => {
  const { size } = statSync(LOG_FILE);
  console.log(
    `Registers ${count.toLocaleString()}, Size: ${convertFromBytesToGB(size)} GB`,
  );
});
