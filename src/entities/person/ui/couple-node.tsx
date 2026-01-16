import { Handle } from '@xyflow/react';
import { User01, User02 } from '@untitledui/icons';

import type { Person } from '../model/types';

import type { LayoutDirection } from '@/entities/family';
import { useFamilyContext } from '@/entities/family';
import { Avatar } from '@/components/base/avatar/avatar';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { formatDateRange } from '@/shared/lib/format-date';
import { getHandlePositions } from '@/shared/lib/get-handle-positions';
import { cx } from '@/utils/cx';

export interface CoupleNodeData {
    person1: Person;
    person2: Person;
    direction: LayoutDirection;
    isHighlighted?: boolean;
    isDimmed?: boolean;
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

    return (
        <Tooltip title={person.name} description={dateRange} arrow>
            <TooltipTrigger>
                <div
                    onClick={onClick}
                    className={cx(
                        'flex w-[140px] items-center gap-2 rounded-lg p-2 transition-colors',
                        isSelected ? 'bg-active' : 'hover:bg-secondary'
                    )}
                >
                    <Avatar size="sm" placeholderIcon={GenderIcon} contrastBorder />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-sm font-semibold text-primary">{person.name}</span>
                        <span className="truncate text-xs text-tertiary">{dateRange}</span>
                    </div>
                </div>
            </TooltipTrigger>
        </Tooltip>
    );
}

export function CoupleNode({ data, selected }: CoupleNodeProps): React.ReactNode {
    const { person1, person2, direction, isHighlighted, isDimmed } = data;
    const { selectedPersonId, setSelectedPersonId, setHoveredNodeId } = useFamilyContext();
    const coupleNodeId = `couple-${person1.id}-${person2.id}`;
    const isSelected = selectedPersonId === person1.id || selectedPersonId === person2.id || selected || isHighlighted;
    const handlePositions = getHandlePositions(direction);

    const isHorizontalLayout = direction === 'LR' || direction === 'RL';

    return (
        <>
            <Handle type="target" id="parents" position={handlePositions.parents} className="!bg-border-primary" />
            <div
                onMouseEnter={() => setHoveredNodeId(coupleNodeId)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={cx(
                    'flex cursor-pointer items-center gap-1 rounded-xl border bg-primary/80 p-1.5 shadow-xs backdrop-blur-sm transition-all',
                    isHorizontalLayout && 'flex-col',
                    isSelected ? 'border-brand-solid ring-4 ring-brand-solid/20' : 'border-secondary hover:border-primary',
                    isDimmed && 'opacity-30'
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
            <Handle type="source" id="children" position={handlePositions.children} className="!bg-border-primary" />
        </>
    );
}