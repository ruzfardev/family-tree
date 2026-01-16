# Layout Engine

A powerful layout engine for React Flow pipeline nodes, specifically designed for left-to-right pipeline layouts in the Phoenix platform.

## Features

- **Left-to-Right Layout**: Optimized for pipeline workflows
- **Dagre Integration**: Uses Dagre.js for robust graph layout algorithms
- **TypeScript Support**: Full type safety with React Flow compatibility
- **Flexible Configuration**: Customizable spacing, margins, and layout options
- **Error Handling**: Comprehensive validation and error reporting
- **Cycle Detection**: Handles cyclic dependencies gracefully

## Installation

This package is part of the Phoenix monorepo and uses dagre for layout calculations.

## Usage

### Basic Usage

```typescript
import { layoutPipelineNodes } from '@shared/layout-engine';
import type { Node, Edge } from '@xyflow/react';

const nodes: Node[] = [
  { id: '1', type: 'Dataset', position: { x: 0, y: 0 }, data: {} },
  { id: '2', type: 'Transform', position: { x: 0, y: 0 }, data: {} },
  { id: '3', type: 'Output', position: { x: 0, y: 0 }, data: {} },
];

const edges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

const result = layoutPipelineNodes(nodes, edges);

if (result.success) {
  // Use result.nodes with updated positions
  setNodes(result.nodes);
} else {
  console.error('Layout failed:', result.error);
}
```

### Advanced Configuration

```typescript
import { calculateLeftToRightLayout } from '@shared/layout-engine';

const layoutOptions = {
  direction: 'LR' as const,
  nodeSpacing: 100,
  layerSpacing: 250,
  marginX: 75,
  marginY: 75,
};

const result = calculateLeftToRightLayout(nodes, edges, layoutOptions);
```

### Custom Spacing

```typescript
import { calculatePipelineLayout } from '@shared/layout-engine';

const result = calculatePipelineLayout(nodes, edges, {
  nodeSpacing: 120,
  layerSpacing: 180,
});
```

## API Reference

### Main Functions

#### `layoutPipelineNodes(nodes, edges)`
Quick layout function with sensible defaults for most pipeline use cases.

#### `calculateLeftToRightLayout(nodes, edges, options?)`
Main function for left-to-right node positioning with full configuration options.

#### `calculatePipelineLayout(nodes, edges, customSpacing?)`
Layout with custom spacing optimized for pipeline flows.

### Types

#### `LayoutOptions`
Configuration interface for layout algorithms:
- `direction`: Layout direction ('LR', 'TB', 'RL', 'BT')
- `nodeSpacing`: Horizontal spacing between nodes
- `layerSpacing`: Vertical spacing between layers
- `marginX`/`marginY`: Canvas margins
- `preserveSelection`: Keep selected nodes during layout
- `animate`: Enable position change animations

#### `LayoutResult`
Result object containing:
- `nodes`: Nodes with updated positions
- `success`: Layout success status
- `warnings`: Any warning messages
- `error`: Error message if layout failed
- `executionTime`: Layout calculation time

### Utilities

#### `validateGraphStructure(nodes, edges)`
Validates input data and detects issues like cycles or invalid edges.

#### `getNodeDimensions(nodeType)`
Returns dimensions for specific node types.

#### `detectCycles(nodes, edges)`
Detects circular dependencies in the graph.

## Default Node Dimensions

- **Dataset**: 180 × 80
- **Transform**: 180 × 80
- **Join**: 180 × 80
- **Output**: 180 × 80
- **Default**: 180 × 80

## Error Handling

The layout engine provides comprehensive error handling:

- Input validation for nodes and edges
- Cycle detection and warnings
- Invalid position validation
- Graceful fallbacks for edge cases

## Performance

- Optimized for graphs with hundreds of nodes
- Sub-second layout calculation for typical pipeline sizes
- Memory-efficient graph representation

## Dependencies

- `dagre`: Graph layout algorithm library
- `@xyflow/react`: React Flow types (peer dependency)