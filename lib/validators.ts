import { z } from 'zod';

export const createRenderJobSchema = z.object({
  stylePresetId: z.string().cuid(),
});

export const allowedMimeTypes = ['image/png', 'image/jpeg'];
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
