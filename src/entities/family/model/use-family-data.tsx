import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Person } from '@/entities/person/model/types';
import { LoadingIndicator } from '@/components/application/loading-indicator/loading-indicator';

import type { FamilyData, LayoutDirection } from './types';

const DEFAULT_DATA: FamilyData = {
    members: [],
    settings: { direction: 'TB' },
};

async function loadFromFile(): Promise<FamilyData> {
    const response = await fetch('/api/family');
    if (!response.ok) {
        throw new Error('Failed to load family data');
    }
    return response.json();
}

async function saveToFile(data: FamilyData): Promise<void> {
    const response = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to save family data');
    }
}

interface FamilyContextValue {
    data: FamilyData;
    isLoading: boolean;
    selectedPersonId: string | null;
    setSelectedPersonId: (id: string | null) => void;
    hoveredNodeId: string | null;
    setHoveredNodeId: (id: string | null) => void;
    updatePerson: (id: string, updates: Partial<Person>) => void;
    addPerson: (person: Person) => void;
    deletePerson: (id: string) => void;
    setDirection: (direction: LayoutDirection) => void;
    getPersonById: (id: string) => Person | undefined;
}

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function useFamilyContext(): FamilyContextValue {
    const context = useContext(FamilyContext);
    if (!context) {
        throw new Error('useFamilyContext must be used within FamilyProvider');
    }
    return context;
}

interface FamilyProviderProps {
    children: ReactNode;
}

export function FamilyProvider({ children }: FamilyProviderProps): ReactNode {
    const [data, setData] = useState<FamilyData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    useEffect(() => {
        loadFromFile()
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    const updateData = useCallback((newData: FamilyData) => {
        setData(newData);
        saveToFile(newData).catch((err) => console.error('Failed to save:', err));
    }, []);

    const updatePerson = useCallback(
        (id: string, updates: Partial<Person>) => {
            updateData({
                ...data,
                members: data.members.map((person) => (person.id === id ? { ...person, ...updates } : person)),
            });
        },
        [data, updateData]
    );

    const addPerson = useCallback(
        (person: Person) => {
            updateData({
                ...data,
                members: [...data.members, person],
            });
        },
        [data, updateData]
    );

    const deletePerson = useCallback(
        (id: string) => {
            const person = data.members.find((p) => p.id === id);
            if (!person) return;

            // Remove spouse reference
            const updatedMembers = data.members
                .filter((p) => p.id !== id)
                .map((p) => ({
                    ...p,
                    spouseId: p.spouseId === id ? undefined : p.spouseId,
                    parentIds: p.parentIds.filter((parentId) => parentId !== id),
                }));

            updateData({
                ...data,
                members: updatedMembers,
            });

            if (selectedPersonId === id) {
                setSelectedPersonId(null);
            }
        },
        [data, selectedPersonId, updateData]
    );

    const setDirection = useCallback(
        (direction: LayoutDirection) => {
            updateData({
                ...data,
                settings: { ...data.settings, direction },
            });
        },
        [data, updateData]
    );

    const getPersonById = useCallback((id: string) => data.members.find((p) => p.id === id), [data.members]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-primary">
                <LoadingIndicator type="line-spinner" size="lg" label="Loading family data..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-2 bg-primary">
                <span className="text-lg font-medium text-error-primary">Failed to load family data</span>
                <span className="text-sm text-tertiary">{error}</span>
            </div>
        );
    }

    const value: FamilyContextValue = {
        data,
        isLoading,
        selectedPersonId,
        setSelectedPersonId,
        hoveredNodeId,
        setHoveredNodeId,
        updatePerson,
        addPerson,
        deletePerson,
        setDirection,
        getPersonById,
    };

    return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamilyData(): FamilyContextValue {
    return useFamilyContext();
}
