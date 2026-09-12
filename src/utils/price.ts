import { DEFAULT_CURRENCY } from '../constants';

export function formatPrice(
  price?: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = 'en',
): string {
  if (price == null || Number.isNaN(price)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat(locale === 'ur' ? 'ur-PK' : 'en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `Rs. ${price.toLocaleString('en-US')}`;
  }
}
