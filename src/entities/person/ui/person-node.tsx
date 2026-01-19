import { Handle } from '@xyflow/react';
import { ChevronDown, User01, User02 } from '@untitledui/icons';
import { motion } from 'motion/react';

import type { Person } from '../model/types';

import type { LayoutDirection } from '@/entities/family';
import { useFamilyContext } from '@/entities/family';
import type { AddPersonContext } from '@/features/add-person';
import { NodeActionMenu } from '@/features/add-person';
import { formatDateRange } from '@/shared/lib/format-date';
import { getHandlePositions } from '@/shared/lib/get-handle-positions';
import { cx } from '@/utils/cx';

export interface PersonNodeData {
    person: Person;
    direction: LayoutDirection;
    isHighlighted?: boolean;
    isDimmed?: boolean;
    isCollapsed?: boolean;
    onAddAction?: (context: AddPersonContext) => void;
    onToggleCollapse?: (nodeId: string) => void;
}

interface PersonNodeProps {
    data: PersonNodeData;
    selected?: boolean;
}

export function PersonNode({ data, selected }: PersonNodeProps): React.ReactNode {
    const { person, direction, isHighlighted, isDimmed, isCollapsed, onAddAction, onToggleCollapse } = data;
    const { selectedPersonId, setSelectedPersonId, setHoveredNodeId, hasChildren } = useFamilyContext();
    const isSelected = selectedPersonId === person.id || selected || isHighlighted;
    const handlePositions = getHandlePositions(direction);
    const showCollapseButton = hasChildren(person.id) && onToggleCollapse;

    const GenderIcon = person.gender === 'female' ? User02 : User01;
    const dateRange = formatDateRange(person.birthDate, person.deathDate);
    const isFemale = person.gender === 'female';

    return (
        <>
            <Handle
                type="target"
                id="parents"
                position={handlePositions.parents}
                className="!bg-border-primary"
            />

            <Handle
                type="source"
                id="children"
                position={handlePositions.children}
                className="!bg-border-primary"
            />

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
                    onClick={() => setSelectedPersonId(person.id)}
                    onMouseEnter={() => setHoveredNodeId(person.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className={cx(
                        'flex w-[164px] cursor-pointer items-center gap-2 rounded-xl border-l-[6px] border border-primary bg-primary/80 p-3 shadow-xs backdrop-blur-sm transition-all',
                        isFemale ? 'border-l-pink-500' : 'border-l-blue-500',
                        isSelected && 'ring-4 ring-brand-solid/20'
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
                    {showCollapseButton && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleCollapse(person.id);
                            }}
                            className={cx(
                                'flex size-6 shrink-0 items-center justify-center rounded-md',
                                'opacity-0 transition-all duration-200',
                                'hover:bg-secondary',
                                'group-hover:opacity-100',
                                isCollapsed && 'opacity-100 bg-secondary'
                            )}
                            aria-label={isCollapsed ? 'Expand descendants' : 'Collapse descendants'}
                        >
                            <ChevronDown
                                className={cx('size-4 text-tertiary transition-transform', isCollapsed && 'rotate-180')}
                            />
                        </button>
                    )}
                </div>

                {onAddAction && <NodeActionMenu person={person} onAction={onAddAction} />}
            </motion.div>
        </>
    );
}