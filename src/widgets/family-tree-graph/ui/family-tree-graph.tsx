import { useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Panel,
    useNodesState,
    useEdgesState,
    useReactFlow,
    ReactFlowProvider,
    type NodeTypes,
    type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useFamilyContext } from '@/entities/family';
import type { FamilyData } from '@/entities/family';
import { PersonNode } from '@/entities/person/ui/person-node';
import { CoupleNode } from '@/entities/person/ui/couple-node';
import { GraphToolbar } from '@/features/layout-controls';
import { SidebarPanel } from '@/features/edit-person';
import { AddPersonProvider, useAddPersonContext } from '@/features/add-person';
import { calculateDagreLayout } from '@/shared/lib/layout-engine/src';

import { transformFamilyToGraph } from '../lib/transform-data';
import AnimatedEdge from './animated-edge';
import DashedEdge from './dashed-edge';
import { FamilyTreeEmpty } from './family-tree-empty';

const nodeTypes: NodeTypes = {
    person: PersonNode,
    couple: CoupleNode,
};

const edgeTypes: EdgeTypes = {
    animated: AnimatedEdge,
    dashed: DashedEdge,
};

interface FamilyTreeGraphContentProps {
    data: FamilyData;
    setSelectedPersonId: (id: string | null) => void;
    hoveredNodeId: string | null;
}

function FamilyTreeGraphContent({
    data,
    setSelectedPersonId,
    hoveredNodeId,
}: FamilyTreeGraphContentProps): React.ReactNode {
    const { openAddModal } = useAddPersonContext();
    const { fitView } = useReactFlow();

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => transformFamilyToGraph(data), [data]);

    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
        const result = calculateDagreLayout(initialNodes, initialEdges, {
            direction: data.settings.direction,
            nodeSpacing: 50,
            layerSpacing: 100,
            marginX: 50,
            marginY: 50,
            preserveSelection: true,
            animate: true,
        });
        return { nodes: result.nodes, edges: initialEdges };
    }, [initialNodes, initialEdges, data.settings.direction]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    useEffect(() => {
        // Add onAddAction callback to all person and couple nodes
        const nodesWithCallbacks = layoutedNodes.map((node) => {
            if (node.type === 'person' || node.type === 'couple') {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        onAddAction: openAddModal,
                    },
                };
            }
            return node;
        });
        setNodes(nodesWithCallbacks);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges, openAddModal]);

    useEffect(() => {
        // Fit view when layout direction changes
        const timer = setTimeout(() => {
            fitView({ padding: 0.2, duration: 500 });
        }, 50);
        return () => clearTimeout(timer);
    }, [data.settings.direction, fitView]);

    // Handle node hover - update edges and nodes directly
    // Key: use functional setState to read current edges inside, avoiding dependency on edges state
    useEffect(() => {
        if (hoveredNodeId) {
            // First pass: collect connected nodes and update edges together
            setEdges((currentEdges) => {
                // Collect connected nodes from current edges
                const connectedNodeIds = new Set<string>();
                connectedNodeIds.add(hoveredNodeId);

                currentEdges.forEach((edge) => {
                    if (edge.source === hoveredNodeId) {
                        connectedNodeIds.add(edge.target);
                    } else if (edge.target === hoveredNodeId) {
                        connectedNodeIds.add(edge.source);
                    }
                });

                // Update nodes with the collected connected IDs
                setNodes((currentNodes) =>
                    currentNodes.map((node) => ({
                        ...node,
                        data: {
                            ...node.data,
                            isHighlighted: connectedNodeIds.has(node.id),
                            isDimmed: !connectedNodeIds.has(node.id),
                        },
                    }))
                );

                // Return updated edges
                return currentEdges.map((edge) => {
                    const isConnected = edge.source === hoveredNodeId || edge.target === hoveredNodeId;
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            isHighlighted: isConnected,
                            isDimmed: !isConnected,
                        },
                    };
                });
            });
        } else {
            // Reset all edges
            setEdges((currentEdges) =>
                currentEdges.map((edge) => ({
                    ...edge,
                    data: {
                        ...edge.data,
                        isHighlighted: false,
                        isDimmed: false,
                    },
                }))
            );

            // Reset all nodes
            setNodes((currentNodes) =>
                currentNodes.map((node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        isHighlighted: false,
                        isDimmed: false,
                    },
                }))
            );
        }
    }, [hoveredNodeId, setEdges, setNodes]);

    const onPaneClick = useCallback(() => {
        setSelectedPersonId(null);
    }, [setSelectedPersonId]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        >
            <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={2}
                color="var(--color-border-primary)"
            />
            <Panel position="top-left" className="!m-4">
                <GraphToolbar />
            </Panel>
            <Panel position="top-right" className="!m-4">
                <SidebarPanel />
            </Panel>
        </ReactFlow>
    );
}

function FamilyTreeGraphInner(): React.ReactNode {
    const { data, setSelectedPersonId, hoveredNodeId } = useFamilyContext();
    const { openAddModal } = useAddPersonContext();

    const handleAddFirstPerson = useCallback(() => {
        openAddModal({
            relation: 'self',
            relatedPersonIds: [],
        });
    }, [openAddModal]);

    // Show empty state when no family members exist
    if (data.members.length === 0) {
        return <FamilyTreeEmpty onAddFirstPerson={handleAddFirstPerson} />;
    }

    return (
        <FamilyTreeGraphContent
            data={data}
            setSelectedPersonId={setSelectedPersonId}
            hoveredNodeId={hoveredNodeId}
        />
    );
}

export function FamilyTreeGraph(): React.ReactNode {
    return (
        <ReactFlowProvider>
            <AddPersonProvider>
                <FamilyTreeGraphInner />
            </AddPersonProvider>
        </ReactFlowProvider>
    );
}
