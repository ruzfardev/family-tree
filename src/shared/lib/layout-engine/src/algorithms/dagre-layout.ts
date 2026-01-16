import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { LayoutOptions, LayoutResult, LayoutGraph, LayoutGraphNode, LayoutGraphEdge, LayoutDirection } from '../types';
import { getNodeDimensionsForDirection } from '../types';
import { validateGraphStructure, validateNodePositions } from '../utils';

/**
 * Convert React Flow nodes and edges to internal graph representation
 */
export const createLayoutGraph = (nodes: Node[], edges: Edge[], direction: LayoutDirection): LayoutGraph => {
  const graphNodes = new Map<string, LayoutGraphNode>();
  const nodeTypeMap = getNodeDimensionsForDirection(direction);

  // Convert nodes
  nodes.forEach(node => {
    const dimensions = nodeTypeMap[node.type || 'default'] || nodeTypeMap.default;
    graphNodes.set(node.id, {
      id: node.id,
      width: dimensions.width,
      height: dimensions.height,
      originalNode: node,
    });
  });

  // Convert edges
  const graphEdges: LayoutGraphEdge[] = edges
    .filter(edge => graphNodes.has(edge.source) && graphNodes.has(edge.target))
    .map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    }));

  return {
    nodes: graphNodes,
    edges: graphEdges,
  };
};

/**
 * Apply layout positions back to React Flow nodes
 */
export const applyLayoutPositions = (
  dagreGraph: dagre.graphlib.Graph,
  layoutGraph: LayoutGraph,
  options: LayoutOptions
): Node[] => {
  const layoutedNodes: Node[] = [];

  layoutGraph.nodes.forEach((graphNode, nodeId) => {
    const dagreNode = dagreGraph.node(nodeId);
    
    if (dagreNode) {
      // Dagre returns center coordinates, convert to top-left
      const x = dagreNode.x - graphNode.width / 2 + options.marginX;
      const y = dagreNode.y - graphNode.height / 2 + options.marginY;

      layoutedNodes.push({
        ...graphNode.originalNode,
        position: { x, y },
      });
    } else {
      // Fallback for nodes not processed by Dagre
      layoutedNodes.push(graphNode.originalNode);
    }
  });

  return layoutedNodes;
};

/**
 * Create and configure Dagre graph from layout graph
 */
export const createDagreGraph = (
  layoutGraph: LayoutGraph,
  options: LayoutOptions
): dagre.graphlib.Graph => {
  const dagreGraph = new dagre.graphlib.Graph();
  
  // Configure graph
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: options.direction,
    nodesep: options.nodeSpacing,
    ranksep: options.layerSpacing,
    marginx: options.marginX,
    marginy: options.marginY,
  });

  // Add nodes to dagre graph
  layoutGraph.nodes.forEach((node, nodeId) => {
    dagreGraph.setNode(nodeId, {
      width: node.width,
      height: node.height,
    });
  });

  // Add edges to dagre graph
  layoutGraph.edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  return dagreGraph;
};

/**
 * Main Dagre layout algorithm implementation
 */
export const calculateDagreLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions
): LayoutResult => {
  const startTime = performance.now();
  
  try {
    // Validate input
    const validation = validateGraphStructure(nodes, edges);
    if (!validation.isValid) {
      return {
        nodes,
        success: false,
        warnings: validation.warnings,
        error: `Layout validation failed: ${validation.errors.join(', ')}`,
        executionTime: performance.now() - startTime,
      };
    }

    // Create internal graph representation
    const layoutGraph = createLayoutGraph(nodes, edges, options.direction);
    
    if (layoutGraph.nodes.size === 0) {
      return {
        nodes,
        success: false,
        warnings: [],
        error: 'No valid nodes to layout',
        executionTime: performance.now() - startTime,
      };
    }

    // Create and configure Dagre graph
    const dagreGraph = createDagreGraph(layoutGraph, options);
    
    // Run Dagre layout algorithm
    dagre.layout(dagreGraph);
    
    // Apply layout positions back to nodes
    const layoutedNodes = applyLayoutPositions(dagreGraph, layoutGraph, options);
    
    // Validate resulting positions
    if (!validateNodePositions(layoutedNodes)) {
      return {
        nodes,
        success: false,
        warnings: validation.warnings,
        error: 'Layout produced invalid node positions',
        executionTime: performance.now() - startTime,
      };
    }

    return {
      nodes: layoutedNodes,
      success: true,
      warnings: validation.warnings,
      executionTime: performance.now() - startTime,
    };

  } catch (error) {
    return {
      nodes,
      success: false,
      warnings: [],
      error: `Layout calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      executionTime: performance.now() - startTime,
    };
  }
};