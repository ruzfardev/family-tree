import type { Gender } from '@/entities/person';

export type AddPersonRelation = 'child' | 'parent' | 'spouse';

export interface AddPersonContext {
    relation: AddPersonRelation;
    relatedPersonIds: string[];
    suggestedGender?: Gender;
}

export interface AddPersonFormData {
    name: string;
    birthDate?: string;
    deathDate?: string;
    gender: Gender;
}

export const DEFAULT_FORM_DATA: AddPersonFormData = {
    name: '',
    gender: 'male',
};
