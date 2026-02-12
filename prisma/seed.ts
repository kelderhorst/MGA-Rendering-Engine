import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.stylePreset.upsert({
    where: { name: 'MGA_Photoreal_V1' },
    update: {
      promptBlock:
        'Locked geometry, neutral daylight, high realism, no added architectural changes.',
      negativePromptBlock: 'Do not alter camera angle, geometry, or structure.',
      strength: 0.25,
    },
    create: {
      name: 'MGA_Photoreal_V1',
      promptBlock:
        'Locked geometry, neutral daylight, high realism, no added architectural changes.',
      negativePromptBlock: 'Do not alter camera angle, geometry, or structure.',
      strength: 0.25,
    },
  });

  await prisma.stylePreset.upsert({
    where: { name: 'MGA_Moody_Twilight_V1' },
    update: {
      promptBlock:
        'Twilight lighting, warm interior glow, cinematic grading, no architectural changes.',
      negativePromptBlock: 'Do not alter camera angle, geometry, or structure.',
      strength: 0.3,
    },
    create: {
      name: 'MGA_Moody_Twilight_V1',
      promptBlock:
        'Twilight lighting, warm interior glow, cinematic grading, no architectural changes.',
      negativePromptBlock: 'Do not alter camera angle, geometry, or structure.',
      strength: 0.3,
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
