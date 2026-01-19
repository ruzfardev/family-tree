import { useCallback, useEffect, useMemo } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useFamilyContext } from "@/entities/family";
import type { FamilyData } from "@/entities/family";
import { PersonNode } from "@/entities/person/ui/person-node";
import { CoupleNode } from "@/entities/person/ui/couple-node";
import { GraphToolbarMobile } from "@/features/layout-controls";
import { BottomSheetPanel } from "@/features/edit-person";
import { AddPersonProvider, useAddPersonContext } from "@/features/add-person";
import { calculateDagreLayout } from "@/shared/lib/layout-engine/src";

import { transformFamilyToGraph } from "../lib/transform-data";
import AnimatedEdge from "./animated-edge";
import DashedEdge from "./dashed-edge";
import { FamilyTreeEmpty } from "./family-tree-empty";

const nodeTypes: NodeTypes = {
    person: PersonNode,
    couple: CoupleNode,
};

const edgeTypes: EdgeTypes = {
    animated: AnimatedEdge,
    dashed: DashedEdge,
};

interface FamilyTreeGraphMobileContentProps {
    data: FamilyData;
    setSelectedPersonId: (id: string | null) => void;
    collapsedNodeIds: Set<string>;
    toggleCollapsed: (nodeId: string) => void;
}

function FamilyTreeGraphMobileContent({
    data,
    setSelectedPersonId,
    collapsedNodeIds,
    toggleCollapsed,
}: FamilyTreeGraphMobileContentProps): React.ReactNode {
    const { openAddModal } = useAddPersonContext();
    const { fitView } = useReactFlow();

    const { nodes: initialNodes, edges: initialEdges } = useMemo(
        () => transformFamilyToGraph(data, { collapsedNodeIds }),
        [data, collapsedNodeIds]
    );

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
        const nodesWithCallbacks = layoutedNodes.map((node) => {
            if (node.type === "person" || node.type === "couple") {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        onAddAction: openAddModal,
                        onToggleCollapse: toggleCollapsed,
                    },
                };
            }
            return node;
        });
        setNodes(nodesWithCallbacks);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges, openAddModal, toggleCollapsed]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fitView({ padding: 0.2, duration: 500 });
        }, 50);
        return () => clearTimeout(timer);
    }, [data.settings.direction, fitView]);

    // No hover effect on mobile - touch devices don't have hover

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
            // Mobile-specific props
            panOnDrag={true}
            panOnScroll={false}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            selectNodesOnDrag={false}
            nodesConnectable={false}
            nodesDraggable={false}
            proOptions={{ hideAttribution: true }}
            style={{ backgroundColor: "var(--color-bg-tertiary)" }}
        >
            <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="var(--color-border-primary)" />
            <Panel position="top-left" className="!m-4">
                <GraphToolbarMobile />
            </Panel>
            {/* No MiniMap on mobile for better performance */}
            <BottomSheetPanel />
        </ReactFlow>
    );
}

function FamilyTreeGraphMobileInner(): React.ReactNode {
    const { data, setSelectedPersonId, collapsedNodeIds, toggleCollapsed } = useFamilyContext();
    const { openAddModal } = useAddPersonContext();

    const handleAddFirstPerson = useCallback(() => {
        openAddModal({
            relation: "self",
            relatedPersonIds: [],
        });
    }, [openAddModal]);

    if (data.members.length === 0) {
        return <FamilyTreeEmpty onAddFirstPerson={handleAddFirstPerson} />;
    }

    return (
        <FamilyTreeGraphMobileContent
            data={data}
            setSelectedPersonId={setSelectedPersonId}
            collapsedNodeIds={collapsedNodeIds}
            toggleCollapsed={toggleCollapsed}
        />
    );
}

export function FamilyTreeGraphMobile(): React.ReactNode {
    return (
        <ReactFlowProvider>
            <AddPersonProvider>
                <FamilyTreeGraphMobileInner />
            </AddPersonProvider>
        </ReactFlowProvider>
    );
}
