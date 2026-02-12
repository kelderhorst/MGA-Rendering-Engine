import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function JobsPage() {
  const session = await auth();
  if (!session?.user?.email) return <p>Please sign in.</p>;

  const jobs = await prisma.renderJob.findMany({
    where: { user: { email: session.user.email } },
    orderBy: { createdAt: 'desc' },
    include: { stylePreset: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Jobs</h1>
      <div className="rounded border bg-white shadow-sm">
        {jobs.map((job) => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between border-b p-4 text-sm">
            <span>{job.stylePreset.name}</span>
            <span className="capitalize text-slate-600">{job.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
