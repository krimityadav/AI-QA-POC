/**
 * StringHelper provides static utility methods for string manipulation,
 * validation, and generation used across the test automation framework.
 */
export class StringHelper {
  /** Domains used for random email generation */
  private static readonly EMAIL_DOMAINS = [
    'testmail.com',
    'qa-auto.net',
    'mailtest.org',
    'example.com',
  ] as const;

  /**
   * Masks a credit card number, showing only the last 4 digits.
   * Input: '4111111111111234' → Output: '****-****-****-1234'
   * @param cardNumber - Raw card number string (digits only or with dashes)
   */
  static maskCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 4) {
      return '****';
    }
    const last4 = digits.slice(-4);
    return `****-****-****-${last4}`;
  }

  /**
   * Normalizes a currency string to a consistent format (e.g. '$1,234.56').
   * Strips extraneous whitespace, normalizes thousands separators.
   * @param amount - Raw currency string (e.g. '$ 1 234.56', '$1,234.56')
   */
  static formatCurrency(amount: string): string {
    const cleaned = amount.replace(/\s/g, '').replace(/,/g, '');
    const num = parseFloat(cleaned.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) {
      return amount.trim();
    }
    const symbol = amount.trim().startsWith('$') ? '$' : '';
    return `${symbol}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  /**
   * Removes leading/trailing whitespace and collapses internal multiple spaces
   * to a single space.
   * @param text - Input string to sanitize
   */
  static sanitizeText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Generates a random valid email address using a timestamp and random suffix.
   * Format: qa_<timestamp>_<random>@<domain>
   */
  static generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 9000) + 1000;
    const domain =
      StringHelper.EMAIL_DOMAINS[
        Math.floor(Math.random() * StringHelper.EMAIL_DOMAINS.length)
      ];
    return `qa_${timestamp}_${random}@${domain}`;
  }

  /**
   * Generates a random 10-digit US phone number string (digits only).
   * First digit is always non-zero to avoid invalid area codes.
   */
  static generateRandomPhone(): string {
    const areaCode = Math.floor(Math.random() * 800) + 200; // 200–999
    const exchange = Math.floor(Math.random() * 800) + 200; // 200–999
    const subscriber = Math.floor(Math.random() * 9000) + 1000; // 1000–9999
    return `${areaCode}${exchange}${subscriber}`;
  }

  /**
   * Validates an email address using an RFC 5321-compatible regex pattern.
   * @param email - Email address to validate
   */
  static isValidEmail(email: string): boolean {
    // Covers the vast majority of RFC 5321 compliant addresses
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates that a phone number contains only digits (no spaces, dashes, or parens).
   * @param phone - Phone number string to validate
   */
  static isValidPhone(phone: string): boolean {
    return /^\d{10,15}$/.test(phone);
  }

  /**
   * Extracts an order number from a page text blob.
   * Looks for patterns like 'Order number: 123456', 'Order #123456', or standalone numeric IDs.
   * @param text - Full page text to search
   * @returns The first matched order number string, or null if not found
   */
  static extractOrderNumber(text: string): string | null {
    const patterns = [
      /[Oo]rder\s+(?:number|#|no\.?)[\s:#]*(\d+)/i,
      /[Oo]rder\s+(\d{4,})/i,
      /#(\d{4,})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Truncates a string to the given maximum length, appending '...' if truncated.
   * @param text - Input string
   * @param maxLength - Maximum allowed length including the ellipsis
   */
  static truncate(text: string, maxLength: number): string {
    if (maxLength < 4) {
      // Not enough room for any content + ellipsis
      return text.slice(0, maxLength);
    }
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 3)}...`;
  }

  /**
   * Converts a camelCase or PascalCase string to kebab-case.
   * Useful for generating CSS class names or file slugs.
   * @param text - Input string in camelCase or PascalCase
   */
  static toKebabCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
  }

  /**
   * Pads a string on the left with the given character to reach the target length.
   * @param value - Input string or number
   * @param length - Target total length
   * @param padChar - Character to use for padding (defaults to '0')
   */
  static padLeft(value: string | number, length: number, padChar = '0'): string {
    return String(value).padStart(length, padChar);
  }
}
