import type { Node, Edge } from "@xyflow/react";
import { LayoutOptions, LayoutResult, DEFAULT_LAYOUT_OPTIONS } from "../types";
import { calculateDagreLayout } from "./dagre-layout";

/**
 * Calculate left-to-right pipeline layout using Dagre algorithm
 * This is the main function for left-to-right node positioning
 */
export const calculateLeftToRightLayout = (
	nodes: Node[],
	edges: Edge[],
	options: Partial<LayoutOptions> = {}
): LayoutResult => {
	// Merge with defaults and ensure left-to-right direction
	const layoutOptions: LayoutOptions = {
		...DEFAULT_LAYOUT_OPTIONS,
		...options,
		direction: "LR", // Force left-to-right for this function
	};

	return calculateDagreLayout(nodes, edges, layoutOptions);
};

/**
 * Calculate layout with custom spacing optimized for pipeline flows
 */
export const calculatePipelineLayout = (
	nodes: Node[],
	edges: Edge[],
	customSpacing?: { nodeSpacing?: number; layerSpacing?: number }
): LayoutResult => {
	const options: Partial<LayoutOptions> = {
		direction: "LR",
		...(customSpacing?.nodeSpacing && { nodeSpacing: customSpacing.nodeSpacing }),
		...(customSpacing?.layerSpacing && { layerSpacing: customSpacing.layerSpacing }),
	};

	return calculateLeftToRightLayout(nodes, edges, options);
};

/**
 * Quick layout function with sensible defaults for most pipeline use cases
 */
export const layoutPipelineNodes = (
	nodes: Node[],
	edges: Edge[]
): LayoutResult => {
	return calculatePipelineLayout(nodes, edges);
};
