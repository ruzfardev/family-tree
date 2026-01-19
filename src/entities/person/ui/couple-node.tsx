import { Handle } from '@xyflow/react';
import { ChevronDown, ChevronUp, Plus, Users01, UserPlus01 } from '@untitledui/icons';
import { User01, User02 } from '@untitledui/icons';
import { motion } from 'motion/react';
import { Button as AriaButton } from 'react-aria-components';

import type { Person } from '../model/types';

import type { LayoutDirection } from '@/entities/family';
import { useFamilyContext } from '@/entities/family';
import type { AddPersonContext } from '@/features/add-person';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { formatDateRange } from '@/shared/lib/format-date';
import { getHandlePositions } from '@/shared/lib/get-handle-positions';
import { cx } from '@/utils/cx';

export interface CoupleNodeData {
    person1: Person;
    person2: Person;
    direction: LayoutDirection;
    isHighlighted?: boolean;
    isDimmed?: boolean;
    isCollapsed?: boolean;
    person1HasParentConnection?: boolean;
    person2HasParentConnection?: boolean;
    hasChildConnection?: boolean;
    onAddAction?: (context: AddPersonContext) => void;
    onToggleCollapse?: (nodeId: string) => void;
}

interface CoupleNodeProps {
    data: CoupleNodeData;
    selected?: boolean;
}

interface PersonCardProps {
    person: Person;
    isSelected: boolean;
    onClick: () => void;
}

function PersonCard({ person, isSelected, onClick }: PersonCardProps) {
    const GenderIcon = person.gender === 'female' ? User02 : User01;
    const dateRange = formatDateRange(person.birthDate, person.deathDate);
    const isFemale = person.gender === 'female';

    return (
        <div
            onClick={onClick}
            className={cx(
                'flex w-[140px] items-center gap-2 rounded-lg p-2 transition-colors',
                isSelected ? 'bg-active' : 'hover:bg-secondary'
            )}
        >
            <div
                className={cx(
                    'flex size-8 shrink-0 items-center justify-center rounded-full',
                    isFemale ? 'bg-pink-100' : 'bg-blue-100'
                )}
            >
                <GenderIcon className={cx('size-5', isFemale ? 'text-pink-600' : 'text-blue-600')} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-primary">{person.name}</span>
                <span className="truncate text-xs text-tertiary">{dateRange}</span>
            </div>
        </div>
    );
}

export function CoupleNode({ data, selected }: CoupleNodeProps): React.ReactNode {
    const { person1, person2, direction, isHighlighted, isDimmed, isCollapsed, person1HasParentConnection, person2HasParentConnection, hasChildConnection, onAddAction, onToggleCollapse } = data;
    const { selectedPersonId, setSelectedPersonId, setHoveredNodeId, getParentsOf, hasChildren } = useFamilyContext();
    const coupleNodeId = `couple-${person1.id}-${person2.id}`;
    const isSelected = selectedPersonId === person1.id || selectedPersonId === person2.id || selected || isHighlighted;
    const handlePositions = getHandlePositions(direction);

    const isHorizontalLayout = direction === 'LR' || direction === 'RL';

    // Check if couple has children (either person)
    const coupleHasChildren = hasChildren(person1.id) || hasChildren(person2.id);

    // Check if we can add parents (need at least one person with < 2 parents)
    const person1Parents = getParentsOf(person1.id);
    const person2Parents = getParentsOf(person2.id);
    const canAddParentToPerson1 = person1Parents.length < 2;
    const canAddParentToPerson2 = person2Parents.length < 2;

    const handleAddChild = () => {
        onAddAction?.({
            relation: 'child',
            relatedPersonIds: [person1.id, person2.id],
        });
    };

    const handleAddParent = (personId: string) => {
        onAddAction?.({
            relation: 'parent',
            relatedPersonIds: [personId],
        });
    };

    return (
        <>
            {person1HasParentConnection && (
                <Handle
                    type="target"
                    id={`parents-${person1.id}`}
                    position={handlePositions.parents}
                    style={isHorizontalLayout ? { top: '25%' } : { left: '25%' }}
                    className="!bg-border-primary"
                />
            )}
            {person2HasParentConnection && (
                <Handle
                    type="target"
                    id={`parents-${person2.id}`}
                    position={handlePositions.parents}
                    style={isHorizontalLayout ? { top: '75%' } : { left: '75%' }}
                    className="!bg-border-primary"
                />
            )}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: isDimmed ? 0.3 : 1,
                    scale: 1,
                }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                }}
                className="group relative"
            >
                <div
                    onMouseEnter={() => setHoveredNodeId(coupleNodeId)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className={cx(
                        'flex cursor-pointer items-center gap-1 rounded-xl border border-primary bg-primary/80 p-1.5 shadow-xs backdrop-blur-sm transition-all',
                        isHorizontalLayout && 'flex-col',
                        isSelected && 'border-brand-solid ring-4 ring-brand-solid/20'
                    )}
                >
                    <PersonCard
                        person={person1}
                        isSelected={selectedPersonId === person1.id}
                        onClick={() => setSelectedPersonId(person1.id)}
                    />

                    <div className={cx(isHorizontalLayout ? 'h-px w-full' : 'h-10 w-px', 'bg-border-secondary')} />

                    <PersonCard
                        person={person2}
                        isSelected={selectedPersonId === person2.id}
                        onClick={() => setSelectedPersonId(person2.id)}
                    />
                </div>

                {onAddAction && (
                    <Dropdown.Root>
                        <AriaButton
                            aria-label="Add family member"
                            className={cx(
                                'absolute -right-2 -top-2 z-10 flex size-6 items-center justify-center',
                                'rounded-full bg-brand-solid text-white shadow-md',
                                'opacity-0 transition-all duration-200',
                                'hover:bg-brand-solid_hover hover:scale-110',
                                'focus:outline-none focus:ring-2 focus:ring-brand-solid focus:ring-offset-2',
                                'group-hover:opacity-100'
                            )}
                        >
                            <Plus className="size-4" />
                        </AriaButton>
                        <Dropdown.Popover placement="bottom start">
                            <Dropdown.Menu aria-label="Add family member">
                                <Dropdown.Item label="Add Child" icon={Users01} onAction={handleAddChild} />
                                {canAddParentToPerson1 && (
                                    <Dropdown.Item
                                        label={`Add Parent to ${person1.name}`}
                                        icon={UserPlus01}
                                        onAction={() => handleAddParent(person1.id)}
                                    />
                                )}
                                {canAddParentToPerson2 && (
                                    <Dropdown.Item
                                        label={`Add Parent to ${person2.name}`}
                                        icon={UserPlus01}
                                        onAction={() => handleAddParent(person2.id)}
                                    />
                                )}
                                {coupleHasChildren && onToggleCollapse && (
                                    <>
                                        <Dropdown.Separator />
                                        <Dropdown.Item
                                            label={isCollapsed ? 'Expand Descendants' : 'Collapse Descendants'}
                                            icon={isCollapsed ? ChevronDown : ChevronUp}
                                            onAction={() => onToggleCollapse(coupleNodeId)}
                                        />
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown.Root>
                )}
            </motion.div>
            {hasChildConnection && (
                <Handle type="source" id="children" position={handlePositions.children} className="!bg-border-primary" />
            )}
        </>
    );
}