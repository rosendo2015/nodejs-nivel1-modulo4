// Precisamos gerar um arquivo access.log fake

import { timeStamp } from "node:console";
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

const stream = crateWriteStream(LOG_FILE);

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
    id: faker.datatype.uuid(),
  };
}

function generateLogEntry(user) {
  return {
    ...user,
    timeStamp: faker.date.recent().toISOString(),
  };
}

function writerRecord(line) {
  return new Promise((resolve) => {
    if (!stream.write(line)) {
      stream.once("drain", resolve);
    } else {
      resolve;
    }
  });
}
