'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProcessingPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState('processing');
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/jobs/${params.id}`);
      const data = (await response.json()) as { status: string };
      setStatus(data.status);
      if (data.status === 'complete') {
        clearInterval(interval);
        router.push(`/jobs/${params.id}`);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [params.id, router]);

  return (
    <div className="rounded border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Rendering in Progress</h1>
      <p className="mt-3 text-sm text-slate-600">Current status: {status}</p>
      <div className="mt-4 h-2 overflow-hidden rounded bg-slate-200">
        <div className="h-full w-2/3 animate-pulse bg-slate-900" />
      </div>
    </div>
  );
}
