import { memo, type CSSProperties } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

export interface DashedEdgeData {
    isHighlighted?: boolean;
    isDimmed?: boolean;
}

function DashedEdge(props: EdgeProps) {
    const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style = {} } = props;
    const edgeData = data as DashedEdgeData | undefined;
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    const isHighlighted = edgeData?.isHighlighted ?? false;
    const isDimmed = edgeData?.isDimmed ?? false;

    const edgeStyle: CSSProperties = {
        ...style,
        stroke: isHighlighted ? 'var(--color-fg-brand-primary)' : 'var(--color-border-secondary)',
        strokeWidth: isHighlighted ? 2.5 : 1.5,
        strokeDasharray: '8 4',
        strokeLinecap: 'round',
        opacity: isDimmed ? 0.15 : 1,
        transition: 'stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease',
        animation: isHighlighted ? 'dashFlow 0.5s linear infinite' : undefined,
    };

    const markerId = `arrow-${id}`;
    const markerColor = isHighlighted ? 'var(--color-fg-brand-primary)' : 'var(--color-border-secondary)';

    return (
        <>
            <defs>
                <marker
                    id={markerId}
                    markerWidth="16"
                    markerHeight="16"
                    viewBox="0 0 16 16"
                    refX="10"
                    refY="8"
                    orient="auto-start-reverse"
                    markerUnits="userSpaceOnUse"
                >
                    <path
                        d="M 0 0 L 16 8 L 0 16 z"
                        fill={markerColor}
                        style={{ transition: 'fill 0.2s ease' }}
                    />
                </marker>
            </defs>
            <style>
                {`
                    @keyframes dashFlow {
                        from { stroke-dashoffset: 12; }
                        to { stroke-dashoffset: 0; }
                    }
                `}
            </style>
            <BaseEdge id={id} path={edgePath} markerEnd={`url(#${markerId})`} style={edgeStyle} />
        </>
    );
}

export default memo(DashedEdge);
