import { useCallback, useEffect, useMemo } from 'react';
import {
    ReactFlow,
    Background,
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
import { PersonNode } from '@/entities/person/ui/person-node';
import { CoupleNode } from '@/entities/person/ui/couple-node';
import { GraphToolbar } from '@/features/layout-controls';
import { SidebarPanel } from '@/features/edit-person';
import { calculateDagreLayout } from '@/shared/lib/layout-engine/src';

import { transformFamilyToGraph } from '../lib/transform-data';
import AnimatedEdge from './animated-edge';
import DashedEdge from './dashed-edge';

const nodeTypes: NodeTypes = {
    person: PersonNode,
    couple: CoupleNode,
};

const edgeTypes: EdgeTypes = {
    animated: AnimatedEdge,
    dashed: DashedEdge,
};

function FamilyTreeGraphInner(): React.ReactNode {
    const { data, selectedPersonId, setSelectedPersonId, hoveredNodeId } = useFamilyContext();
    const { fitView, setCenter, getZoom } = useReactFlow();

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
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

    useEffect(() => {
        // Fit view when layout changes with smooth animation
        const timer = setTimeout(() => {
            fitView({ padding: 0.2, duration: 500 });
        }, 50);
        return () => clearTimeout(timer);
    }, [data.settings.direction, fitView]);

    // Center on selected node with smooth animation
    useEffect(() => {
        if (!selectedPersonId) return;

        // Find the node containing the selected person
        const selectedNode = nodes.find((node) => {
            if (node.type === 'person') {
                return node.id === selectedPersonId;
            }
            if (node.type === 'couple') {
                const coupleData = node.data as { person1: { id: string }; person2: { id: string } };
                return coupleData.person1.id === selectedPersonId || coupleData.person2.id === selectedPersonId;
            }
            return false;
        });

        if (selectedNode) {
            // Get node dimensions (approximate)
            const nodeWidth = selectedNode.type === 'couple' ? 300 : 164;
            const nodeHeight = selectedNode.type === 'couple' ? 80 : 60;

            // Center on the node with current zoom level
            const x = selectedNode.position.x + nodeWidth / 2;
            const y = selectedNode.position.y + nodeHeight / 2;
            const zoom = getZoom();

            setCenter(x, y, { zoom, duration: 500 });
        }
    }, [selectedPersonId, nodes, setCenter, getZoom]);

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
            className="bg-secondary"
        >
            <Background gap={20} size={1} />
            <Panel position="top-left" className="!m-4">
                <GraphToolbar />
            </Panel>
            <Panel position="top-right" className="!m-4">
                <SidebarPanel />
            </Panel>
        </ReactFlow>
    );
}

export function FamilyTreeGraph(): React.ReactNode {
    return (
        <ReactFlowProvider>
            <FamilyTreeGraphInner />
        </ReactFlowProvider>
    );
}
