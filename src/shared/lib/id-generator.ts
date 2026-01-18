/**
 * Generate unique IDs for new persons
 * Format: "person-{timestamp}-{random}"
 */
export function generatePersonId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `person-${timestamp}-${random}`;
}
