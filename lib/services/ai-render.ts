export type AiRenderInput = {
  clayImageUrl: string;
  lineworkImageUrl?: string | null;
  materialIdImageUrl?: string | null;
  stylePreset: string;
  strength: number;
};

export async function requestRenderFromAi(input: AiRenderInput): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Placeholder output URLs while external AI API is not integrated yet.
  // Keep this shape stable so a real provider can replace this function.
  return [1, 2, 3, 4].map(
    (index) => `/api/mock-image/${index}?style=${encodeURIComponent(input.stylePreset)}`,
  );
}
