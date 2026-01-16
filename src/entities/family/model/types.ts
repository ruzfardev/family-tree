import type { Person } from '@/entities/person/model/types';

export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

export interface FamilySettings {
    direction: LayoutDirection;
}

export interface FamilyData {
    members: Person[];
    settings: FamilySettings;
}
