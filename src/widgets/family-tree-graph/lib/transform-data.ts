import type { Edge, Node } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';

import type { Person } from '@/entities/person/model/types';
import type { FamilyData, LayoutDirection } from '@/entities/family/model/types';
import type { PersonNodeData } from '@/entities/person/ui/person-node';
import type { CoupleNodeData } from '@/entities/person/ui/couple-node';

interface TransformResult {
    nodes: Node[];
    edges: Edge[];
}

interface TransformOptions {
    collapsedNodeIds?: Set<string>;
}

/**
 * Get all descendant person IDs from a given set of parent IDs
 * Also includes spouses of descendants (they should be hidden together)
 */
function getDescendantIds(members: Person[], parentIds: string[]): Set<string> {
    const descendants = new Set<string>();
    const queue = [...parentIds];
    const memberMap = new Map<string, Person>(members.map((m) => [m.id, m]));

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const children = members.filter((m) => m.parentIds.includes(currentId));
        for (const child of children) {
            if (!descendants.has(child.id)) {
                descendants.add(child.id);
                queue.push(child.id);

                // Also hide the spouse of this descendant
                if (child.spouseId && !descendants.has(child.spouseId)) {
                    const spouse = memberMap.get(child.spouseId);
                    if (spouse) {
                        descendants.add(spouse.id);
                        // Also traverse spouse's descendants
                        queue.push(spouse.id);
                    }
                }
            }
        }
    }

    return descendants;
}

export function transformFamilyToGraph(data: FamilyData, options: TransformOptions = {}): TransformResult {
    const { collapsedNodeIds = new Set() } = options;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const processedSpouses = new Set<string>();
    const direction: LayoutDirection = data.settings.direction;

    // Create a map for quick lookup
    const memberMap = new Map<string, Person>(data.members.map((m) => [m.id, m]));

    // Track which nodes have connections (to hide handles without connections)
    const nodesWithParentConnection = new Set<string>();
    const nodesWithChildConnection = new Set<string>();
    // Track specific person IDs that have parent connections (for couple nodes)
    const personsWithParentConnection = new Set<string>();

    // Compute hidden person IDs (descendants of collapsed nodes)
    const collapsedPersonIds: string[] = [];
    collapsedNodeIds.forEach((nodeId) => {
        if (nodeId.startsWith('couple-')) {
            // Couple node ID format: couple-{person1Id}-{person2Id}
            // Person IDs contain dashes, so we need to find them in the members list
            const coupleIdPart = nodeId.slice('couple-'.length);
            // Find matching person IDs from members
            for (const member of data.members) {
                if (coupleIdPart.startsWith(member.id + '-')) {
                    // Found person1
                    collapsedPersonIds.push(member.id);
                    const person2Id = coupleIdPart.slice(member.id.length + 1);
                    if (memberMap.has(person2Id)) {
                        collapsedPersonIds.push(person2Id);
                    }
                    break;
                }
            }
        } else {
            collapsedPersonIds.push(nodeId);
        }
    });
    const hiddenPersonIds = getDescendantIds(data.members, collapsedPersonIds);

    // Track which couple node contains which person
    const personToCoupleNode = new Map<string, string>();

    data.members.forEach((person) => {
        // Skip if this person is hidden (descendant of collapsed node)
        if (hiddenPersonIds.has(person.id)) return;

        // Skip if already processed as part of a couple
        if (processedSpouses.has(person.id)) return;

        const spouse = person.spouseId ? memberMap.get(person.spouseId) : undefined;
        // Check if spouse is also visible
        const visibleSpouse = spouse && !hiddenPersonIds.has(spouse.id) ? spouse : undefined;

        if (visibleSpouse && !processedSpouses.has(visibleSpouse.id)) {
            // Create couple node
            const coupleNodeId = `couple-${person.id}-${visibleSpouse.id}`;
            processedSpouses.add(person.id);
            processedSpouses.add(visibleSpouse.id);
            personToCoupleNode.set(person.id, coupleNodeId);
            personToCoupleNode.set(visibleSpouse.id, coupleNodeId);

            // Check if this couple node is collapsed (has hidden children)
            const isCollapsed = collapsedNodeIds.has(coupleNodeId);

            const nodeData: CoupleNodeData = {
                person1: person,
                person2: visibleSpouse,
                direction,
                isCollapsed,
            };

            nodes.push({
                id: coupleNodeId,
                type: 'couple',
                position: { x: 0, y: 0 },
                data: nodeData as unknown as Record<string, unknown>,
            });
        } else if (!visibleSpouse) {
            // Create single person node
            const isCollapsed = collapsedNodeIds.has(person.id);
            const nodeData: PersonNodeData = { person, direction, isCollapsed };
            nodes.push({
                id: person.id,
                type: 'person',
                position: { x: 0, y: 0 },
                data: nodeData as unknown as Record<string, unknown>,
            });
        }
    });

    // Create edges from parents to children (only for visible nodes)
    data.members.forEach((person) => {
        // Skip if this person is hidden
        if (hiddenPersonIds.has(person.id)) return;
        if (person.parentIds.length === 0) return;

        // Find parent node (could be couple or single)
        const parent1 = memberMap.get(person.parentIds[0]);
        if (!parent1) return;

        // Skip if parent is hidden
        if (hiddenPersonIds.has(parent1.id)) return;

        const parentNodeId = personToCoupleNode.get(parent1.id) ?? parent1.id;
        const childNodeId = personToCoupleNode.get(person.id) ?? person.id;

        // Determine target handle - use person-specific handle if child is in a couple node
        const targetHandle = personToCoupleNode.has(person.id) ? `parents-${person.id}` : 'parents';

        // Track connections for hiding handles
        nodesWithChildConnection.add(parentNodeId);
        nodesWithParentConnection.add(childNodeId);
        personsWithParentConnection.add(person.id);

        // Avoid duplicate edges (use person.id to make edges unique per person, not per node)
        const edgeId = `edge-${parentNodeId}-${person.id}`;
        if (!edges.some((e) => e.id === edgeId)) {
            edges.push({
                id: edgeId,
                source: parentNodeId,
                target: childNodeId,
                type: 'dashed',
                sourceHandle: 'children',
                targetHandle,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 16,
                    height: 16,
                },
                data: {
                    isHighlighted: false,
                    isDimmed: false,
                },
            });
        }
    });

    // Update nodes with connection info
    nodes.forEach((node) => {
        const hasParentConnection = nodesWithParentConnection.has(node.id);
        const hasChildConnection = nodesWithChildConnection.has(node.id);

        if (node.type === 'couple') {
            const coupleData = node.data as unknown as CoupleNodeData;
            // For couple nodes, track each person's parent connection separately
            coupleData.hasChildConnection = hasChildConnection;
            coupleData.person1HasParentConnection = personsWithParentConnection.has(coupleData.person1.id);
            coupleData.person2HasParentConnection = personsWithParentConnection.has(coupleData.person2.id);
        } else {
            const personData = node.data as unknown as PersonNodeData;
            personData.hasParentConnection = hasParentConnection;
            personData.hasChildConnection = hasChildConnection;
        }
    });

    return { nodes, edges };
}
