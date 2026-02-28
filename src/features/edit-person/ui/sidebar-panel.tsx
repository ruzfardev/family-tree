import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash01, User01, User02, X } from '@untitledui/icons';

import type { Gender, Person } from '@/entities/person';
import { useFamilyContext } from '@/entities/family';
import { useAuthContext } from '@/features/auth';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { Input } from '@/components/base/input/input';
import { formatDateRange } from '@/shared/lib/format-date';

export function SidebarPanel(): React.ReactNode {
    const { t } = useTranslation();
    const { isGuest } = useAuthContext();
    const { selectedPersonId, setSelectedPersonId, getPersonById, updatePerson, deletePerson } = useFamilyContext();

    if (isGuest) return null;

    const person = selectedPersonId ? getPersonById(selectedPersonId) : null;

    const [formData, setFormData] = useState<Partial<Person>>({});

    useEffect(() => {
        if (person) {
            setFormData({
                name: person.name,
                birthDate: person.birthDate,
                deathDate: person.deathDate,
                gender: person.gender,
            });
        }
    }, [person]);

    const handleChange = useCallback(
        (field: keyof Person, value: string) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            if (selectedPersonId) {
                updatePerson(selectedPersonId, { [field]: value || undefined });
            }
        },
        [selectedPersonId, updatePerson]
    );

    const handleDelete = useCallback(() => {
        if (selectedPersonId && confirm(t('editPerson.deleteConfirm'))) {
            deletePerson(selectedPersonId);
        }
    }, [selectedPersonId, deletePerson]);

    if (!person) {
        return (
            <div className="flex w-72 flex-col items-center justify-center rounded-xl border border-secondary bg-primary p-6 shadow-lg">
                <p className="text-sm text-tertiary">{t('editPerson.selectPrompt')}</p>
            </div>
        );
    }

    const GenderIcon = person.gender === 'female' ? User02 : User01;

    return (
        <div className="flex w-80 flex-col rounded-xl border border-secondary bg-primary shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-secondary p-4">
                <div className="flex items-center gap-3">
                    <Avatar size="md" placeholderIcon={GenderIcon} contrastBorder />
                    <div>
                        <h3 className="text-sm font-semibold text-primary">{person.name}</h3>
                        <p className="text-xs text-tertiary">{formatDateRange(person.birthDate, person.deathDate)}</p>
                    </div>
                </div>
                <Button color="tertiary" iconLeading={X} onClick={() => setSelectedPersonId(null)} aria-label={t('editPerson.closePanel')} />
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4 p-4">
                <Input
                    label={t('common.name')}
                    placeholder={t('common.namePlaceholder')}
                    value={formData.name ?? ''}
                    onChange={(value) => handleChange('name', value)}
                />

                <Input
                    label={t('editPerson.birthDate')}
                    placeholder={t('common.yearPlaceholder')}
                    value={formData.birthDate ?? ''}
                    onChange={(value) => handleChange('birthDate', value)}
                />

                <Input
                    label={t('editPerson.deathDate')}
                    placeholder={t('common.deathPlaceholder')}
                    value={formData.deathDate ?? ''}
                    onChange={(value) => handleChange('deathDate', value)}
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-secondary">{t('common.gender')}</label>
                    <ButtonGroup
                        selectedKeys={formData.gender ? [formData.gender] : []}
                        onSelectionChange={(keys) => {
                            const selected = [...keys][0] as Gender;
                            if (selected) handleChange('gender', selected);
                        }}
                    >
                        <ButtonGroupItem id="male" iconLeading={User01}>{t('common.male')}</ButtonGroupItem>
                        <ButtonGroupItem id="female" iconLeading={User02}>{t('common.female')}</ButtonGroupItem>
                    </ButtonGroup>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-secondary p-4">
                <Button color="primary-destructive" iconLeading={Trash01} className="w-full" onClick={handleDelete}>
                    {t('editPerson.deletePerson')}
                </Button>
            </div>
        </div>
    );
}
