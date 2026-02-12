import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateReadSasUrl } from '@/lib/services/blob-storage';

export async function GET(_: Request, context: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const job = await prisma.renderJob.findUnique({
    where: { id: context.params.id },
    include: { user: true },
  });

  if (!job || job.user.email !== session.user.email) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const signedOutputs = await Promise.all(
    job.outputImages.map(async (imageUrl) => (imageUrl.startsWith('http') ? generateReadSasUrl(imageUrl) : imageUrl)),
  );

  return NextResponse.json({ ...job, outputImages: signedOutputs });
}
