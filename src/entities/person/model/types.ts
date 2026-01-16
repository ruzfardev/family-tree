export type Gender = 'male' | 'female';

export interface Person {
    id: string;
    name: string;
    birthDate?: string;
    deathDate?: string;
    gender: Gender;
    spouseId?: string;
    parentIds: string[];
}