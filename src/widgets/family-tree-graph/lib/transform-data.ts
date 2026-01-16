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

export function transformFamilyToGraph(data: FamilyData): TransformResult {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const processedSpouses = new Set<string>();
    const direction: LayoutDirection = data.settings.direction;

    // Create a map for quick lookup
    const memberMap = new Map<string, Person>(data.members.map((m) => [m.id, m]));

    // Track which couple node contains which person
    const personToCoupleNode = new Map<string, string>();

    data.members.forEach((person) => {
        // Skip if already processed as part of a couple
        if (processedSpouses.has(person.id)) return;

        const spouse = person.spouseId ? memberMap.get(person.spouseId) : undefined;

        if (spouse && !processedSpouses.has(spouse.id)) {
            // Create couple node
            const coupleNodeId = `couple-${person.id}-${spouse.id}`;
            processedSpouses.add(person.id);
            processedSpouses.add(spouse.id);
            personToCoupleNode.set(person.id, coupleNodeId);
            personToCoupleNode.set(spouse.id, coupleNodeId);

            const nodeData: CoupleNodeData = {
                person1: person,
                person2: spouse,
                direction,
            };

            nodes.push({
                id: coupleNodeId,
                type: 'couple',
                position: { x: 0, y: 0 },
                data: nodeData as unknown as Record<string, unknown>,
            });
        } else if (!spouse) {
            // Create single person node
            const nodeData: PersonNodeData = { person, direction };
            nodes.push({
                id: person.id,
                type: 'person',
                position: { x: 0, y: 0 },
                data: nodeData as unknown as Record<string, unknown>,
            });
        }
    });

    // Create edges from parents to children
    data.members.forEach((person) => {
        if (person.parentIds.length === 0) return;

        // Find parent node (could be couple or single)
        const parent1 = memberMap.get(person.parentIds[0]);
        if (!parent1) return;

        const parentNodeId = personToCoupleNode.get(parent1.id) ?? parent1.id;
        const childNodeId = personToCoupleNode.get(person.id) ?? person.id;

        // Avoid duplicate edges
        const edgeId = `edge-${parentNodeId}-${childNodeId}`;
        if (!edges.some((e) => e.id === edgeId)) {
            edges.push({
                id: edgeId,
                source: parentNodeId,
                target: childNodeId,
                type: 'dashed',
                sourceHandle: 'children',
                targetHandle: 'parents',
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

    return { nodes, edges };
}
