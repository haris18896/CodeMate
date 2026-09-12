import { z } from 'zod';
import { MAX_NAME_LENGTH } from '../constants';
import { isExpiryValid } from './date';

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
    price: z.preprocess(
      value => {
        if (typeof value === 'string' && value.trim() === '') {
          return undefined;
        }
        return typeof value === 'string' ? Number(value) : value;
      },
      z
        .number({ error: 'Price is required' })
        .positive('Price must be greater than 0'),
    ),
    createdDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid creation date'),
    expiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid expiry date'),
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
    if (!isExpiryValid(data.createdDate, data.expiryDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiryDate'],
        message: 'Expiry must be on or after creation date',
      });
    }
  });

export type GenerateCodeFormValues = z.infer<typeof generateCodeSchema>;
