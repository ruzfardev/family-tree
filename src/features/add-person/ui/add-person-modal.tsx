import { useState, useCallback, useEffect } from 'react';
import { User01, User02, X } from '@untitledui/icons';

import type { Gender } from '@/entities/person';
import { Button } from '@/components/base/buttons/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { Input } from '@/components/base/input/input';
import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal';

import type { AddPersonContext, AddPersonFormData } from '../model/types';
import { DEFAULT_FORM_DATA } from '../model/types';

interface AddPersonModalProps {
    isOpen: boolean;
    context: AddPersonContext | null;
    onClose: () => void;
    onSubmit: (data: AddPersonFormData) => void;
}

export function AddPersonModal({ isOpen, context, onClose, onSubmit }: AddPersonModalProps): React.ReactNode {
    const [formData, setFormData] = useState<AddPersonFormData>(DEFAULT_FORM_DATA);

    // Reset form when modal opens with new context
    useEffect(() => {
        if (isOpen && context) {
            setFormData({
                ...DEFAULT_FORM_DATA,
                gender: context.suggestedGender ?? 'male',
            });
        }
    }, [isOpen, context]);

    const handleChange = useCallback((field: keyof AddPersonFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value || undefined }));
    }, []);

    const handleSubmit = useCallback(() => {
        if (!formData.name.trim()) return;
        onSubmit(formData);
    }, [formData, onSubmit]);

    const getTitle = () => {
        if (!context) return 'Add Person';
        switch (context.relation) {
            case 'child':
                return 'Add Child';
            case 'parent':
                return 'Add Parent';
            case 'spouse':
                return 'Add Spouse';
        }
    };

    const title = getTitle();

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={(open) => !open && onClose()} isDismissable>
            <Modal className="max-w-md">
                <Dialog aria-label={title}>
                    <div className="flex w-full flex-col rounded-xl border border-secondary bg-primary shadow-xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-secondary p-4">
                            <h2 className="text-lg font-semibold text-primary">{title}</h2>
                            <Button
                                color="tertiary"
                                iconLeading={X}
                                onClick={onClose}
                                aria-label="Close"
                            />
                        </div>

                        {/* Form */}
                        <div className="flex flex-col gap-4 p-4">
                            <Input
                                label="Name"
                                placeholder="Enter name"
                                value={formData.name}
                                onChange={(value) => handleChange('name', value)}
                                autoFocus
                            />

                            <Input
                                label="Birth Year"
                                placeholder="YYYY"
                                value={formData.birthDate ?? ''}
                                onChange={(value) => handleChange('birthDate', value)}
                            />

                            <Input
                                label="Death Year"
                                placeholder="YYYY (leave empty if living)"
                                value={formData.deathDate ?? ''}
                                onChange={(value) => handleChange('deathDate', value)}
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-secondary">Gender</label>
                                <ButtonGroup
                                    selectedKeys={[formData.gender]}
                                    onSelectionChange={(keys) => {
                                        const selected = [...keys][0] as Gender;
                                        if (selected) handleChange('gender', selected);
                                    }}
                                >
                                    <ButtonGroupItem id="male" iconLeading={User01}>
                                        Male
                                    </ButtonGroupItem>
                                    <ButtonGroupItem id="female" iconLeading={User02}>
                                        Female
                                    </ButtonGroupItem>
                                </ButtonGroup>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 border-t border-secondary p-4">
                            <Button color="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onClick={handleSubmit} isDisabled={!formData.name.trim()}>
                                Add Person
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
