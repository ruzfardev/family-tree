import { useCallback, useEffect, useState } from 'react';
import { Trash01, User01, User02, X } from '@untitledui/icons';

import type { Gender, Person } from '@/entities/person';
import { useFamilyContext } from '@/entities/family';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { Input } from '@/components/base/input/input';
import { formatDateRange } from '@/shared/lib/format-date';

export function SidebarPanel(): React.ReactNode {
    const { selectedPersonId, setSelectedPersonId, getPersonById, updatePerson, deletePerson } = useFamilyContext();

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
        if (selectedPersonId && confirm('Are you sure you want to delete this person?')) {
            deletePerson(selectedPersonId);
        }
    }, [selectedPersonId, deletePerson]);

    if (!person) {
        return (
            <div className="flex w-72 flex-col items-center justify-center rounded-xl border border-secondary bg-primary p-6 shadow-lg">
                <p className="text-sm text-tertiary">Select a person to edit</p>
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
                <Button color="tertiary" iconLeading={X} onClick={() => setSelectedPersonId(null)} aria-label="Close panel" />
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4 p-4">
                <Input
                    label="Name"
                    placeholder="Enter name"
                    value={formData.name ?? ''}
                    onChange={(value) => handleChange('name', value)}
                />

                <Input
                    label="Birth Date"
                    placeholder="YYYY"
                    value={formData.birthDate ?? ''}
                    onChange={(value) => handleChange('birthDate', value)}
                />

                <Input
                    label="Death Date"
                    placeholder="YYYY (leave empty if living)"
                    value={formData.deathDate ?? ''}
                    onChange={(value) => handleChange('deathDate', value)}
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-secondary">Gender</label>
                    <ButtonGroup
                        selectedKeys={formData.gender ? [formData.gender] : []}
                        onSelectionChange={(keys) => {
                            const selected = [...keys][0] as Gender;
                            if (selected) handleChange('gender', selected);
                        }}
                    >
                        <ButtonGroupItem id="male" iconLeading={User01}>Male</ButtonGroupItem>
                        <ButtonGroupItem id="female" iconLeading={User02}>Female</ButtonGroupItem>
                    </ButtonGroup>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-secondary p-4">
                <Button color="primary-destructive" iconLeading={Trash01} className="w-full" onClick={handleDelete}>
                    Delete Person
                </Button>
            </div>
        </div>
    );
}
