import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requestRenderFromAi } from '@/lib/services/ai-render';

export async function POST(_: Request, context: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const job = await prisma.renderJob.findUnique({
    where: { id: context.params.id },
    include: { user: true, stylePreset: true },
  });

  if (!job || job.user.email !== session.user.email) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.renderJob.update({
    where: { id: job.id },
    data: { status: 'processing', outputImages: [] },
  });

  requestRenderFromAi({
    clayImageUrl: job.clayImageUrl,
    lineworkImageUrl: job.lineworkImageUrl,
    materialIdImageUrl: job.materialIdImageUrl,
    stylePreset: job.stylePreset.name,
    strength: job.stylePreset.strength,
  }).then(async (outputImages) => {
    await prisma.renderJob.update({
      where: { id: job.id },
      data: { status: 'complete', outputImages },
    });
  });

  return NextResponse.redirect(new URL(`/processing/${job.id}`, process.env.NEXTAUTH_URL ?? 'http://localhost:3000'));
}
