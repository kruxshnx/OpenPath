import { PrismaClient } from '@prisma/client';
import { SKILL_CATALOG } from '../src/skills.catalog';

const prisma = new PrismaClient();

async function main() {
  for (const skill of SKILL_CATALOG) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      create: { name: skill.name, type: skill.type, aliases: skill.aliases },
      update: { type: skill.type, aliases: skill.aliases },
    });
  }
  console.log(`Seeded ${SKILL_CATALOG.length} skills`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
