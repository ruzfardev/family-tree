import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
        if (!context) return t('addPerson.title.default');
        switch (context.relation) {
            case 'child':
                return t('addPerson.title.child');
            case 'parent':
                return t('addPerson.title.parent');
            case 'spouse':
                return t('addPerson.title.spouse');
            case 'self':
                return t('addPerson.title.self');
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
                                aria-label={t('common.close')}
                            />
                        </div>

                        {/* Form */}
                        <div className="flex flex-col gap-4 p-4">
                            <Input
                                label={t('common.name')}
                                placeholder={t('common.namePlaceholder')}
                                value={formData.name}
                                onChange={(value) => handleChange('name', value)}
                                autoFocus
                            />

                            <Input
                                label={t('common.birthYear')}
                                placeholder={t('common.yearPlaceholder')}
                                value={formData.birthDate ?? ''}
                                onChange={(value) => handleChange('birthDate', value)}
                            />

                            <Input
                                label={t('common.deathYear')}
                                placeholder={t('common.deathPlaceholder')}
                                value={formData.deathDate ?? ''}
                                onChange={(value) => handleChange('deathDate', value)}
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-secondary">{t('common.gender')}</label>
                                <ButtonGroup
                                    selectedKeys={[formData.gender]}
                                    onSelectionChange={(keys) => {
                                        const selected = [...keys][0] as Gender;
                                        if (selected) handleChange('gender', selected);
                                    }}
                                >
                                    <ButtonGroupItem id="male" iconLeading={User01}>
                                        {t('common.male')}
                                    </ButtonGroupItem>
                                    <ButtonGroupItem id="female" iconLeading={User02}>
                                        {t('common.female')}
                                    </ButtonGroupItem>
                                </ButtonGroup>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 border-t border-secondary p-4">
                            <Button color="secondary" onClick={onClose}>
                                {t('common.cancel')}
                            </Button>
                            <Button color="primary" onClick={handleSubmit} isDisabled={!formData.name.trim()}>
                                {t('addPerson.submit')}
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
