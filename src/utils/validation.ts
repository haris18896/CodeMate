import { z } from 'zod';
import { MAX_NAME_LENGTH } from '../constants';
import { isExpiryOnOrAfterToday } from './date';

export const generateCodeSchema = z
  .object({
    englishName: z
      .string()
      .trim()
      .max(MAX_NAME_LENGTH, 'Name is too long')
      .optional()
      .or(z.literal('')),
    urduName: z
      .string()
      .trim()
      .max(MAX_NAME_LENGTH, 'Name is too long')
      .optional()
      .or(z.literal('')),
    expiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid expiry date'),
    customFields: z.record(z.string(), z.string()).optional().default({}),
  })
  .superRefine((data, ctx) => {
    const hasEnglish = Boolean(data.englishName?.trim());
    const hasUrdu = Boolean(data.urduName?.trim());
    if (!hasEnglish && !hasUrdu) {
      ctx.addIssue({
        code: 'custom',
        path: ['englishName'],
        message: 'Name is required',
      });
      ctx.addIssue({
        code: 'custom',
        path: ['urduName'],
        message: 'Name is required',
      });
    }
    if (!isExpiryOnOrAfterToday(data.expiryDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiryDate'],
        message: 'Expiry must be today or later',
      });
    }
  });

export type GenerateCodeFormValues = z.infer<typeof generateCodeSchema>;
