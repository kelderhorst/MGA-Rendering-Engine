import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  const job = await prisma.renderJob.findUniqueOrThrow({
    where: { id: params.id },
    include: { stylePreset: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{job.stylePreset.name}</h1>
        <Link href="/jobs" className="text-sm underline">Back</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {job.outputImages.map((imageUrl) => (
          <div key={imageUrl} className="rounded border bg-white p-2">
            <Image src={imageUrl} alt="render output" width={800} height={600} className="h-auto w-full" />
            <a href={imageUrl} download className="mt-2 inline-block text-sm underline">Download</a>
          </div>
        ))}
      </div>

      <form action={`/api/jobs/${job.id}/rerender`} method="post">
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Re-render</button>
      </form>
    </div>
  );
}
