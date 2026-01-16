import { Position } from '@xyflow/react';

import type { LayoutDirection } from '@/entities/family';

export interface HandlePositions {
    /** Handle for incoming parent connections */
    parents: Position;
    /** Handle for outgoing child connections */
    children: Position;
}

/**
 * Get handle positions based on layout direction.
 *
 * TB: Parents on top, children on bottom
 * BT: Parents on bottom, children on top
 * LR: Parents on left, children on right
 * RL: Parents on right, children on left
 */
export const getHandlePositions = (direction: LayoutDirection): HandlePositions => {
    switch (direction) {
        case 'TB':
            return {
                parents: Position.Top,
                children: Position.Bottom,
            };
        case 'BT':
            return {
                parents: Position.Bottom,
                children: Position.Top,
            };
        case 'LR':
            return {
                parents: Position.Left,
                children: Position.Right,
            };
        case 'RL':
            return {
                parents: Position.Right,
                children: Position.Left,
            };
    }
};
