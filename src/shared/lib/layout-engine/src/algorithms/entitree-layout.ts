import { layoutFromMap } from 'entitree-flex';
import type { Node, Edge } from '@xyflow/react';
import type { LayoutOptions, LayoutResult } from '../types';
import { getNodeDimensions } from '../utils';

/**
 * Input node structure for entitree layout
 * This extends the original node data with relationship info
 */
interface EntitreeInputNode {
    id: string;
    width: number;
    height: number;
    children?: string[];
    spouses?: string[];
    originalNode: Node;
}

/**
 * Calculate family tree layout using entitree-flex algorithm
 *
 * entitree-flex is specifically designed for genealogy with support for:
 * - Variable node sizes (enableFlex)
 * - Spouse relationships (nextAfterAccessor: 'spouses')
 * - All 4 orientations (TB, BT, LR, RL)
 */
export const calculateEntitreeLayout = (
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions
): LayoutResult => {
    const startTime = performance.now();

    try {
        if (nodes.length === 0) {
            return {
                nodes: [],
                success: true,
                warnings: [],
                executionTime: performance.now() - startTime,
            };
        }

        // Build flat tree structure for entitree
        const flatTree: Record<string, EntitreeInputNode> = {};
        const childrenMap = new Map<string, string[]>();
        const spousesMap = new Map<string, string[]>();

        // Initialize all nodes
        nodes.forEach(node => {
            const dimensions = getNodeDimensions(node.type);
            flatTree[node.id] = {
                id: node.id,
                width: node.measured?.width ?? dimensions.width,
                height: node.measured?.height ?? dimensions.height,
                children: [],
                spouses: [],
                originalNode: node,
            };
            childrenMap.set(node.id, []);
            spousesMap.set(node.id, []);
        });

        // Build parent-child relationships from edges
        edges.forEach(edge => {
            // Parent-child edges: source is parent, target is child
            if (edge.data?.edgeType !== 'spouse') {
                const children = childrenMap.get(edge.source);
                if (children && flatTree[edge.target]) {
                    children.push(edge.target);
                }
            }
            // Spouse edges: connect two people as spouses
            if (edge.data?.edgeType === 'spouse') {
                const spouses1 = spousesMap.get(edge.source);
                if (spouses1 && flatTree[edge.target]) {
                    spouses1.push(edge.target);
                }
            }
        });

        // Apply relationships to flat tree
        Object.keys(flatTree).forEach(id => {
            flatTree[id].children = childrenMap.get(id) || [];
            flatTree[id].spouses = spousesMap.get(id) || [];
        });

        // Find root node (node with no incoming parent-child edges)
        const nodesWithParents = new Set<string>();
        edges.forEach(edge => {
            if (edge.data?.edgeType !== 'spouse') {
                nodesWithParents.add(edge.target);
            }
        });

        // Also exclude nodes that are spouses (they'll be positioned relative to their partner)
        const spouseNodes = new Set<string>();
        edges.forEach(edge => {
            if (edge.data?.edgeType === 'spouse') {
                spouseNodes.add(edge.target);
            }
        });

        const rootCandidates = nodes.filter(
            n => !nodesWithParents.has(n.id) && !spouseNodes.has(n.id)
        );

        if (rootCandidates.length === 0) {
            return {
                nodes,
                success: false,
                warnings: [],
                error: 'No root node found for family tree',
                executionTime: performance.now() - startTime,
            };
        }

        // Use first root candidate (typically the oldest ancestor)
        const rootId = rootCandidates[0].id;

        // Determine orientation based on direction
        // entitree-flex only supports vertical and horizontal
        // For BT and RL, we'll flip coordinates after layout
        const isHorizontal = options.direction === 'LR' || options.direction === 'RL';
        const needsFlip = options.direction === 'BT' || options.direction === 'RL';

        // Calculate layout
        const result = layoutFromMap(rootId, flatTree, {
            orientation: isHorizontal ? 'horizontal' : 'vertical',
            firstDegreeSpacing: options.nodeSpacing,
            secondDegreeSpacing: options.nodeSpacing * 1.5,
            sourceTargetSpacing: options.layerSpacing,
            nextAfterAccessor: 'spouses',
            nextAfterSpacing: options.nodeSpacing / 2,
            targetsAccessor: 'children',
            enableFlex: true,
            nodeWidth: 180,
            nodeHeight: 64,
            rootX: options.marginX,
            rootY: options.marginY,
        });

        // Convert back to React Flow nodes
        const layoutedNodes: Node[] = [];

        result.nodes.forEach(treeNode => {
            const inputNode = flatTree[treeNode.id];
            if (!inputNode) return;

            let x = treeNode.x;
            let y = treeNode.y;

            // Apply flip for BT and RL directions
            if (needsFlip) {
                if (options.direction === 'BT') {
                    // Flip Y axis
                    y = result.maxBottom - y;
                } else if (options.direction === 'RL') {
                    // Flip X axis
                    x = result.maxRight - x;
                }
            }

            layoutedNodes.push({
                ...inputNode.originalNode,
                position: { x, y },
                data: {
                    ...inputNode.originalNode.data,
                    isSpouse: treeNode.isNextAfter,
                },
            });
        });

        return {
            nodes: layoutedNodes,
            success: true,
            warnings: [],
            executionTime: performance.now() - startTime,
        };

    } catch (error) {
        return {
            nodes,
            success: false,
            warnings: [],
            error: `Entitree layout failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            executionTime: performance.now() - startTime,
        };
    }
};
