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

export interface PersonNodeData {
    person: Person;
    direction: LayoutDirection;
    isHighlighted?: boolean;
    isDimmed?: boolean;
}

interface PersonNodeProps {
    data: PersonNodeData;
    selected?: boolean;
}

export function PersonNode({ data, selected }: PersonNodeProps): React.ReactNode {
    const { person, direction, isHighlighted, isDimmed } = data;
    const { selectedPersonId, setSelectedPersonId, setHoveredNodeId } = useFamilyContext();
    const isSelected = selectedPersonId === person.id || selected || isHighlighted;
    const handlePositions = getHandlePositions(direction);

    const GenderIcon = person.gender === 'female' ? User02 : User01;
    const dateRange = formatDateRange(person.birthDate, person.deathDate);

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

            <Tooltip title={person.name} description={dateRange} arrow>
                <TooltipTrigger>
                    <div
                        onClick={() => setSelectedPersonId(person.id)}
                        onMouseEnter={() => setHoveredNodeId(person.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className={cx(
                            'flex w-[164px] cursor-pointer items-center gap-2 rounded-xl border bg-primary/80 p-3 shadow-xs backdrop-blur-sm transition-all',
                            isSelected ? 'border-brand-solid ring-4 ring-brand-solid/20' : 'border-secondary hover:border-primary',
                            isDimmed && 'opacity-30'
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
        </>
    );
}