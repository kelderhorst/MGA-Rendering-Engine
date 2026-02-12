import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { UploadForm } from '@/components/upload-form';

export default async function HomePage() {
  const presets = await prisma.stylePreset.findMany({ orderBy: { createdAt: 'asc' } });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">MGA Rendering Engine</h1>
        <Link href="/jobs" className="text-sm text-slate-700 underline">
          View Jobs
        </Link>
      </header>
      <UploadForm presets={presets} />
    </div>
  );
}
