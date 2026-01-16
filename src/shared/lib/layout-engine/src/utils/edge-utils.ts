import type { Node, Edge } from '@xyflow/react';
import type { ValidationResult } from '../types';

/**
 * Detect cycles in the graph using DFS
 */
export const detectCycles = (nodes: Node[], edges: Edge[]): string[] => {
  const nodeIds = new Set(nodes.map(node => node.id));
  const graph = new Map<string, string[]>();
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[] = [];

  // Build adjacency list
  nodeIds.forEach(nodeId => graph.set(nodeId, []));
  edges.forEach(edge => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      graph.get(edge.source)!.push(edge.target);
    }
  });

  // DFS to detect cycles
  const dfs = (nodeId: string, path: string[]): boolean => {
    if (recursionStack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      if (cycleStart !== -1) {
        cycles.push(path.slice(cycleStart).concat([nodeId]).join(' -> '));
      }
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor, [...path])) {
        // Cycle detected, but continue to find all cycles
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  // Check all nodes for cycles
  nodeIds.forEach(nodeId => {
    if (!visited.has(nodeId)) {
      dfs(nodeId, []);
    }
  });

  return cycles;
};

/**
 * Find nodes with no incoming edges (source nodes)
 */
export const findSourceNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  const nodeIds = new Set(nodes.map(node => node.id));
  const targetIds = new Set(edges.map(edge => edge.target).filter(id => nodeIds.has(id)));
  
  return nodes.filter(node => !targetIds.has(node.id));
};

/**
 * Find nodes with no outgoing edges (sink nodes)
 */
export const findSinkNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  const nodeIds = new Set(nodes.map(node => node.id));
  const sourceIds = new Set(edges.map(edge => edge.source).filter(id => nodeIds.has(id)));
  
  return nodes.filter(node => !sourceIds.has(node.id));
};

/**
 * Find disconnected nodes (no edges at all)
 */
export const findDisconnectedNodes = (nodes: Node[], edges: Edge[]): Node[] => {
  const nodeIds = new Set(nodes.map(node => node.id));
  const connectedIds = new Set<string>();
  
  edges.forEach(edge => {
    if (nodeIds.has(edge.source)) connectedIds.add(edge.source);
    if (nodeIds.has(edge.target)) connectedIds.add(edge.target);
  });
  
  return nodes.filter(node => !connectedIds.has(node.id));
};

/**
 * Calculate the depth/layer of each node in the graph
 */
export const calculateNodeLayers = (nodes: Node[], edges: Edge[]): Map<string, number> => {
  const nodeIds = new Set(nodes.map(node => node.id));
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const layers = new Map<string, number>();

  // Initialize graph and in-degree count
  nodeIds.forEach(nodeId => {
    graph.set(nodeId, []);
    inDegree.set(nodeId, 0);
  });

  // Build graph and calculate in-degrees
  edges.forEach(edge => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      graph.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
  });

  // Topological sort with layer calculation
  const queue: { nodeId: string; layer: number }[] = [];
  
  // Start with nodes that have no incoming edges
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push({ nodeId, layer: 0 });
      layers.set(nodeId, 0);
    }
  });

  while (queue.length > 0) {
    const { nodeId, layer } = queue.shift()!;
    const neighbors = graph.get(nodeId) || [];

    neighbors.forEach(neighbor => {
      const newInDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newInDegree);

      if (newInDegree === 0) {
        const neighborLayer = layer + 1;
        layers.set(neighbor, neighborLayer);
        queue.push({ nodeId: neighbor, layer: neighborLayer });
      }
    });
  }

  // Handle disconnected nodes by assigning them to layer 0
  nodeIds.forEach(nodeId => {
    if (!layers.has(nodeId)) {
      layers.set(nodeId, 0);
    }
  });

  return layers;
};

/**
 * Validate edges and nodes for layout processing
 */
export const validateGraphStructure = (nodes: Node[], edges: Edge[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for empty inputs
  if (nodes.length === 0) {
    errors.push('No nodes provided for layout');
    return { isValid: false, errors, warnings };
  }

  // Check for valid node IDs
  const nodeIds = new Set(nodes.map(node => node.id));
  if (nodeIds.size !== nodes.length) {
    errors.push('Duplicate node IDs found');
  }

  // Check for invalid edges
  const invalidEdges = edges.filter(edge => 
    !nodeIds.has(edge.source) || !nodeIds.has(edge.target)
  );
  
  if (invalidEdges.length > 0) {
    warnings.push(`${invalidEdges.length} edges reference non-existent nodes`);
  }

  // Check for self-loops
  const selfLoops = edges.filter(edge => edge.source === edge.target);
  if (selfLoops.length > 0) {
    warnings.push(`${selfLoops.length} self-loop edges found`);
  }

  // Check for cycles
  const cycles = detectCycles(nodes, edges);
  if (cycles.length > 0) {
    warnings.push(`${cycles.length} cycles detected in graph: ${cycles.join(', ')}`);
  }

  // Check for disconnected nodes
  const disconnectedNodes = findDisconnectedNodes(nodes, edges);
  if (disconnectedNodes.length > 0) {
    warnings.push(`${disconnectedNodes.length} disconnected nodes found`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};