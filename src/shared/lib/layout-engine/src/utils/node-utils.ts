import type { Node } from "@xyflow/react";
import { NodeDimensions, NodeTypeMap, DEFAULT_NODE_DIMENSIONS } from "../types";

/**
 * Get dimensions for a specific node type
 */
export const getNodeDimensions = (
	nodeType: string | undefined,
	nodeTypeMap: NodeTypeMap = DEFAULT_NODE_DIMENSIONS
): NodeDimensions => {
	if (!nodeType) {
		return nodeTypeMap.default || { width: 180, height: 80 };
	}

	return (
		nodeTypeMap[nodeType] || nodeTypeMap.default || { width: 180, height: 80 }
	);
};

/**
 * Calculate the bounding box of a collection of nodes
 */
export const getNodesBoundingBox = (nodes: Node[]) => {
	if (nodes.length === 0) {
		return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
	}

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	nodes.forEach((node) => {
		const dimensions = getNodeDimensions(node.type);
		const nodeMinX = node.position.x;
		const nodeMinY = node.position.y;
		const nodeMaxX = node.position.x + dimensions.width;
		const nodeMaxY = node.position.y + dimensions.height;

		minX = Math.min(minX, nodeMinX);
		minY = Math.min(minY, nodeMinY);
		maxX = Math.max(maxX, nodeMaxX);
		maxY = Math.max(maxY, nodeMaxY);
	});

	return {
		minX,
		minY,
		maxX,
		maxY,
		width: maxX - minX,
		height: maxY - minY,
	};
};

/**
 * Center nodes within a specific area
 */
export const centerNodesInArea = (
	nodes: Node[],
	areaWidth: number,
	areaHeight: number,
	offsetX: number = 0,
	offsetY: number = 0
): Node[] => {
	const boundingBox = getNodesBoundingBox(nodes);

	const centerX = (areaWidth - boundingBox.width) / 2 + offsetX;
	const centerY = (areaHeight - boundingBox.height) / 2 + offsetY;

	const deltaX = centerX - boundingBox.minX;
	const deltaY = centerY - boundingBox.minY;

	return nodes.map((node) => ({
		...node,
		position: {
			x: node.position.x + deltaX,
			y: node.position.y + deltaY,
		},
	}));
};

/**
 * Apply minimum spacing between nodes
 */
export const applyMinimumSpacing = (
	nodes: Node[],
	minSpacingX: number = 20,
	minSpacingY: number = 20
): Node[] => {
	// Sort nodes by position for overlap detection
	const sortedNodes = [...nodes].sort((a, b) => {
		if (Math.abs(a.position.y - b.position.y) < 10) {
			return a.position.x - b.position.x;
		}
		return a.position.y - b.position.y;
	});

	const adjustedNodes = [...sortedNodes];

	for (let i = 1; i < adjustedNodes.length; i++) {
		const currentNode = adjustedNodes[i];
		const prevNode = adjustedNodes[i - 1];

		const currentDims = getNodeDimensions(currentNode.type);
		const prevDims = getNodeDimensions(prevNode.type);

		// Check for horizontal overlap
		const horizontalOverlap =
			prevNode.position.x + prevDims.width + minSpacingX >
			currentNode.position.x;

		// Check for vertical overlap
		const verticalOverlap =
			Math.abs(currentNode.position.y - prevNode.position.y) <
			Math.max(currentDims.height, prevDims.height) + minSpacingY;

		if (horizontalOverlap && verticalOverlap) {
			// Adjust position to avoid overlap
			adjustedNodes[i] = {
				...currentNode,
				position: {
					x: prevNode.position.x + prevDims.width + minSpacingX,
					y: currentNode.position.y,
				},
			};
		}
	}

	return adjustedNodes;
};

/**
 * Validate node positions are within reasonable bounds
 */
export const validateNodePositions = (nodes: Node[]): boolean => {
	return nodes.every((node) => {
		return (
			Number.isFinite(node.position.x) &&
			Number.isFinite(node.position.y) &&
			node.position.x >= -10000 &&
			node.position.x <= 10000 &&
			node.position.y >= -10000 &&
			node.position.y <= 10000
		);
	});
};
