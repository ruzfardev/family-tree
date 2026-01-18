import { createContext, useContext, type ReactNode } from 'react';

import { AddPersonModal } from '../ui/add-person-modal';
import { useAddPerson } from './use-add-person';
import type { AddPersonContext as AddPersonCtx } from './types';

interface AddPersonContextValue {
    openAddModal: (ctx: AddPersonCtx) => void;
}

const AddPersonContext = createContext<AddPersonContextValue | null>(null);

export function useAddPersonContext(): AddPersonContextValue {
    const context = useContext(AddPersonContext);
    if (!context) {
        throw new Error('useAddPersonContext must be used within AddPersonProvider');
    }
    return context;
}

interface AddPersonProviderProps {
    children: ReactNode;
}

export function AddPersonProvider({ children }: AddPersonProviderProps): ReactNode {
    const { isModalOpen, context, openAddModal, closeModal, handleSubmit } = useAddPerson();

    return (
        <AddPersonContext.Provider value={{ openAddModal }}>
            {children}
            <AddPersonModal isOpen={isModalOpen} context={context} onClose={closeModal} onSubmit={handleSubmit} />
        </AddPersonContext.Provider>
    );
}
