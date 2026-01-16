export function formatDateRange(birthDate?: string, deathDate?: string): string {
    if (!birthDate && !deathDate) return '';
    if (deathDate) return `${birthDate ?? '?'} - ${deathDate}`;
    return birthDate ?? '';
}
