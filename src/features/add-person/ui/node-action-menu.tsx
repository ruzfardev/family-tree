import { Plus, UserPlus01, Users01, Heart } from '@untitledui/icons';
import { Button as AriaButton } from 'react-aria-components';

import type { Person } from '@/entities/person';
import { useFamilyContext } from '@/entities/family';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { cx } from '@/utils/cx';

import type { AddPersonContext } from '../model/types';

interface NodeActionMenuProps {
    person: Person;
    onAction: (context: AddPersonContext) => void;
    className?: string;
}

export function NodeActionMenu({ person, onAction, className }: NodeActionMenuProps): React.ReactNode {
    const { getParentsOf, getSpouseOf } = useFamilyContext();

    const parents = getParentsOf(person.id);
    const spouse = getSpouseOf(person.id);
    const canAddParent = parents.length < 2;
    const canAddSpouse = !spouse;

    const handleAddChild = () => {
        onAction({
            relation: 'child',
            relatedPersonIds: spouse ? [person.id, spouse.id] : [person.id],
        });
    };

    const handleAddParent = () => {
        onAction({
            relation: 'parent',
            relatedPersonIds: [person.id],
        });
    };

    const handleAddSpouse = () => {
        onAction({
            relation: 'spouse',
            relatedPersonIds: [person.id],
            suggestedGender: person.gender === 'male' ? 'female' : 'male',
        });
    };

    return (
        <Dropdown.Root>
            <AriaButton
                aria-label="Add family member"
                className={cx(
                    'absolute -right-2 -top-2 z-10 flex size-6 items-center justify-center',
                    'rounded-full bg-brand-solid text-white shadow-md',
                    'opacity-0 transition-all duration-200',
                    'hover:bg-brand-solid_hover hover:scale-110',
                    'focus:outline-none focus:ring-2 focus:ring-brand-solid focus:ring-offset-2',
                    'group-hover:opacity-100',
                    className
                )}
            >
                <Plus className="size-4" />
            </AriaButton>
            <Dropdown.Popover placement="bottom start">
                <Dropdown.Menu aria-label="Add family member">
                    <Dropdown.Item label="Add Child" icon={Users01} onAction={handleAddChild} />
                    {canAddParent && (
                        <Dropdown.Item label="Add Parent" icon={UserPlus01} onAction={handleAddParent} />
                    )}
                    {canAddSpouse && (
                        <Dropdown.Item label="Add Spouse" icon={Heart} onAction={handleAddSpouse} />
                    )}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    );
}
