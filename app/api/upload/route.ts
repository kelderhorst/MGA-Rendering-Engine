import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createRenderJobSchema, allowedMimeTypes, MAX_FILE_SIZE_BYTES } from '@/lib/validators';
import { uploadToBlob } from '@/lib/services/blob-storage';
import { requestRenderFromAi } from '@/lib/services/ai-render';

async function validateAndReadFile(file: File | null, required = false) {
  if (!file) {
    if (required) throw new Error('Missing required file');
    return null;
  }

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error('Only PNG/JPG files are allowed');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File exceeds 20MB limit');
  }

  return Buffer.from(await file.arrayBuffer());
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const payload = createRenderJobSchema.parse({ stylePresetId: formData.get('stylePresetId') });

    const clayFile = formData.get('clayImage') as File | null;
    const lineworkFile = formData.get('lineworkImage') as File | null;
    const materialIdFile = formData.get('materialIdImage') as File | null;
    const viewportFile = formData.get('viewportImage') as File | null;

    const [clayBuffer, lineworkBuffer, materialBuffer, viewportBuffer] = await Promise.all([
      validateAndReadFile(clayFile, true),
      validateAndReadFile(lineworkFile),
      validateAndReadFile(materialIdFile),
      validateAndReadFile(viewportFile),
    ]);

    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: { name: session.user.name ?? undefined },
      create: { email: session.user.email, name: session.user.name ?? null },
    });

    const now = Date.now();
    const clayImageUrl = await uploadToBlob(`jobs/${user.id}/${now}-clay.png`, clayBuffer!, clayFile!.type);
    const lineworkImageUrl = lineworkBuffer
      ? await uploadToBlob(`jobs/${user.id}/${now}-linework.png`, lineworkBuffer, lineworkFile!.type)
      : null;
    const materialIdImageUrl = materialBuffer
      ? await uploadToBlob(`jobs/${user.id}/${now}-material-id.png`, materialBuffer, materialIdFile!.type)
      : null;
    const viewportImageUrl = viewportBuffer
      ? await uploadToBlob(`jobs/${user.id}/${now}-viewport.png`, viewportBuffer, viewportFile!.type)
      : null;

    const job = await prisma.renderJob.create({
      data: {
        userId: user.id,
        stylePresetId: payload.stylePresetId,
        clayImageUrl,
        lineworkImageUrl,
        materialIdImageUrl,
        viewportImageUrl,
        status: 'processing',
        outputImages: [],
      },
      include: { stylePreset: true },
    });

    requestRenderFromAi({
      clayImageUrl: job.clayImageUrl,
      lineworkImageUrl: job.lineworkImageUrl,
      materialIdImageUrl: job.materialIdImageUrl,
      stylePreset: job.stylePreset.name,
      strength: job.stylePreset.strength,
    })
      .then(async (outputImages) => {
        await prisma.renderJob.update({
          where: { id: job.id },
          data: { status: 'complete', outputImages },
        });
      })
      .catch(async () => {
        await prisma.renderJob.update({
          where: { id: job.id },
          data: { status: 'failed' },
        });
      });

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
