import type { LayoutDirection } from '@/entities/family';

export const GRAPH_CONFIG = {
    nodeWidth: 200,
    nodeHeight: 80,
    coupleNodeWidth: 320,
    coupleNodeHeight: 100,
    rankSep: 80,
    nodeSep: 40,
} as const;

export const DIRECTION_LABELS: Record<LayoutDirection, string> = {
    TB: 'Top to Bottom',
    BT: 'Bottom to Top',
    LR: 'Left to Right',
    RL: 'Right to Left',
};
