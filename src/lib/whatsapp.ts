/**
 * WhatsApp Link Utility
 * Handles clean formatting for Egyptian numbers (010, 011, 012, 015)
 * and international phone numbers.
 */

export function cleanPhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  // Remove all non-digits except a leading +
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If Egyptian standard format (e.g. 01012345678 or 011..., 012..., 015...)
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '2' + cleaned;
  } else if (cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '20' + cleaned;
  }

  return cleaned;
}

export function formatWhatsAppUrl(phone: string, defaultMessage?: string): string {
  const clean = cleanPhoneNumber(phone);
  if (!clean) return '#';
  
  const baseUrl = `https://wa.me/${clean}`;
  if (defaultMessage) {
    return `${baseUrl}?text=${encodeURIComponent(defaultMessage)}`;
  }
  return baseUrl;
}
