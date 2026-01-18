import { memo, type CSSProperties } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

export interface AnimatedEdgeData {
    isHighlighted?: boolean;
    isDimmed?: boolean;
}

function AnimatedEdge(props: EdgeProps) {
    const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style = {} } =
        props;
    const edgeData = data as AnimatedEdgeData | undefined;
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
        stroke: isHighlighted ? 'var(--color-fg-brand-primary)' : 'var(--color-border-primary)',
        strokeWidth: isHighlighted ? 2.5 : 1.5,
        opacity: isDimmed ? 0.15 : 1,
        transition: 'stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease',
    };

    return <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={edgeStyle} />;
}

export default memo(AnimatedEdge);
