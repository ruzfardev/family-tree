import { useCallback, useState } from 'react';

import type { Person } from '@/entities/person';
import { useFamilyContext } from '@/entities/family';
import { generatePersonId } from '@/shared/lib/id-generator';

import type { AddPersonContext, AddPersonFormData } from './types';

export function useAddPerson() {
    const { addPerson, updatePerson, getPersonById } = useFamilyContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [context, setContext] = useState<AddPersonContext | null>(null);

    const openAddModal = useCallback((ctx: AddPersonContext) => {
        setContext(ctx);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setContext(null);
    }, []);

    const handleSubmit = useCallback(
        (formData: AddPersonFormData) => {
            if (!context) return;

            const newPersonId = generatePersonId();
            const newPerson: Person = {
                id: newPersonId,
                name: formData.name,
                birthDate: formData.birthDate,
                deathDate: formData.deathDate,
                gender: formData.gender,
                parentIds: [],
            };

            switch (context.relation) {
                case 'child': {
                    // Set parent IDs for the new child
                    newPerson.parentIds = context.relatedPersonIds;
                    addPerson(newPerson);
                    break;
                }
                case 'parent': {
                    // Add as parent to existing person(s)
                    addPerson(newPerson);
                    context.relatedPersonIds.forEach((childId) => {
                        const child = getPersonById(childId);
                        if (child) {
                            updatePerson(childId, {
                                parentIds: [...child.parentIds, newPersonId],
                            });
                        }
                    });
                    break;
                }
                case 'spouse': {
                    // Link as spouse to existing person
                    const existingPersonId = context.relatedPersonIds[0];
                    newPerson.spouseId = existingPersonId;
                    addPerson(newPerson);
                    updatePerson(existingPersonId, { spouseId: newPersonId });
                    break;
                }
            }

            closeModal();
        },
        [context, addPerson, updatePerson, getPersonById, closeModal]
    );

    return {
        isModalOpen,
        context,
        openAddModal,
        closeModal,
        handleSubmit,
    };
}
