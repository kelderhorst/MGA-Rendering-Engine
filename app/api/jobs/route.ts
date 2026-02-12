import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobs = await prisma.renderJob.findMany({
    where: { user: { email: session.user.email } },
    include: { stylePreset: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(jobs);
}
