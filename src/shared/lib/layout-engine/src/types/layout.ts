import type { Node } from "@xyflow/react";

/**
 * Layout direction options for node positioning
 */
export type LayoutDirection = "LR" | "TB" | "RL" | "BT";

/**
 * Configuration options for layout algorithms
 */
export interface LayoutOptions {
	/** Layout direction - LR: Left-to-Right, TB: Top-to-Bottom, etc. */
	direction: LayoutDirection;
	/** Horizontal spacing between nodes in the same layer */
	nodeSpacing: number;
	/** Vertical spacing between different layers */
	layerSpacing: number;
	/** Canvas margin on X axis */
	marginX: number;
	/** Canvas margin on Y axis */
	marginY: number;
	/** Whether to preserve node selection during layout */
	preserveSelection: boolean;
	/** Whether to animate position changes */
	animate: boolean;
}

/**
 * Default layout options for left-to-right pipeline layout
 */
export const DEFAULT_LAYOUT_OPTIONS: LayoutOptions = {
	direction: "LR",
	nodeSpacing: 50,
	layerSpacing: 80,
	marginX: 20,
	marginY: 20,
	preserveSelection: true,
	animate: true,
};

/**
 * Node dimensions for different node types
 */
export interface NodeDimensions {
	width: number;
	height: number;
}

/**
 * Node type to dimensions mapping
 */
export interface NodeTypeMap {
	[nodeType: string]: NodeDimensions;
}

/**
 * Default node dimensions for vertical layouts (TB, BT)
 * Person: 164px wide, ~56px tall (p-3 + content)
 * Couple: ~312px wide (2x 140px cards + padding + divider), ~56px tall
 */
export const DEFAULT_NODE_DIMENSIONS: NodeTypeMap = {
	Dataset: { width: 180, height: 80 },
	Transform: { width: 180, height: 80 },
	Join: { width: 180, height: 80 },
	Output: { width: 180, height: 80 },
	default: { width: 164, height: 56 },
	// Family tree node types
	person: { width: 164, height: 56 },
	couple: { width: 312, height: 56 },
};

/**
 * Node dimensions for horizontal layouts (LR, RL)
 * Couple nodes are stacked vertically in these layouts
 */
export const HORIZONTAL_NODE_DIMENSIONS: NodeTypeMap = {
	...DEFAULT_NODE_DIMENSIONS,
	couple: { width: 164, height: 112 },
};

/**
 * Get node dimensions based on layout direction
 */
export const getNodeDimensionsForDirection = (
	direction: LayoutDirection
): NodeTypeMap => {
	return direction === "LR" || direction === "RL"
		? HORIZONTAL_NODE_DIMENSIONS
		: DEFAULT_NODE_DIMENSIONS;
};

/**
 * Layout result containing positioned nodes and any warnings/errors
 */
export interface LayoutResult {
	/** Nodes with updated positions */
	nodes: Node[];
	/** Layout success status */
	success: boolean;
	/** Any warning messages */
	warnings: string[];
	/** Error message if layout failed */
	error?: string;
	/** Layout execution time in milliseconds */
	executionTime: number;
}

/**
 * Input validation result
 */
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Graph structure for layout calculation
 */
export interface LayoutGraph {
	nodes: Map<string, LayoutGraphNode>;
	edges: LayoutGraphEdge[];
}

/**
 * Internal graph node representation for layout calculation
 */
export interface LayoutGraphNode {
	id: string;
	width: number;
	height: number;
	originalNode: Node;
}

/**
 * Internal graph edge representation for layout calculation
 */
export interface LayoutGraphEdge {
	id: string;
	source: string;
	target: string;
	sourceHandle?: string | null;
	targetHandle?: string | null;
}
