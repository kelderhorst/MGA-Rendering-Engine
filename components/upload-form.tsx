'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type StylePreset = {
  id: string;
  name: string;
};

type FieldState = {
  clayImage?: File;
  lineworkImage?: File;
  materialIdImage?: File;
  viewportImage?: File;
};

export function UploadForm({ presets }: { presets: StylePreset[] }) {
  const router = useRouter();
  const [stylePresetId, setStylePresetId] = useState(presets[0]?.id ?? '');
  const [files, setFiles] = useState<FieldState>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!files.clayImage) {
      alert('Clay render is required.');
      return;
    }

    const formData = new FormData();
    formData.set('stylePresetId', stylePresetId);
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.set(key, file);
    });

    setBusy(true);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    setBusy(false);

    if (!response.ok) {
      alert('Upload failed.');
      return;
    }

    const data = (await response.json()) as { jobId: string };
    router.push(`/processing/${data.jobId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">New Render Job</h2>
        <p className="text-sm text-slate-600">Upload SketchUp exports and select a style preset.</p>
      </div>

      <label className="block text-sm font-medium">Style Preset</label>
      <select
        value={stylePresetId}
        onChange={(event) => setStylePresetId(event.target.value)}
        className="w-full rounded border p-2"
      >
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>

      <DropField label="Clay Render (required)" name="clayImage" required onPick={(file) => setFiles((f) => ({ ...f, clayImage: file }))} />
      <DropField label="Linework Image (optional)" name="lineworkImage" onPick={(file) => setFiles((f) => ({ ...f, lineworkImage: file }))} />
      <DropField label="Material ID Map (optional)" name="materialIdImage" onPick={(file) => setFiles((f) => ({ ...f, materialIdImage: file }))} />
      <DropField label="Textured Viewport Screenshot (optional)" name="viewportImage" onPick={(file) => setFiles((f) => ({ ...f, viewportImage: file }))} />

      <button disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" type="submit">
        {busy ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}

function DropField({
  label,
  name,
  required,
  onPick,
}: {
  label: string;
  name: string;
  required?: boolean;
  onPick: (file?: File) => void;
}) {
  const [filename, setFilename] = useState('No file selected');
  const inputRef = useRef<HTMLInputElement | null>(null);

  function useFirstFile(fileList: FileList | null) {
    const file = fileList?.item(0) ?? undefined;
    setFilename(file?.name ?? 'No file selected');
    onPick(file);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div
        className="cursor-pointer rounded border border-dashed p-4 text-sm hover:bg-slate-50"
        onClick={() => inputRef.current?.click()}
        onDrop={(event) => {
          event.preventDefault();
          useFirstFile(event.dataTransfer.files);
        }}
        onDragOver={(event) => event.preventDefault()}
      >
        <p>Drag & drop PNG/JPG here, or click to browse.</p>
        <p className="mt-1 text-xs text-slate-500">{filename}</p>
      </div>
      <input
        ref={inputRef}
        hidden
        type="file"
        name={name}
        required={required}
        accept="image/png,image/jpeg"
        onChange={(event) => useFirstFile(event.target.files)}
      />
    </div>
  );
}
