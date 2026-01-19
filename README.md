# Family Tree

Interactive family tree visualization application built with React and ReactFlow.

## Features

- Interactive graph visualization of family relationships
- Add, edit, and delete family members
- Couple nodes showing spouses together
- Animated edges for parent-child relationships
- Multiple layout directions (top-bottom, bottom-top, left-right, right-left)
- Click to select and view member details
- Hover effects to highlight connections
- Sidebar panel for editing selected person

## Tech Stack

- React 19
- ReactFlow 12
- TypeScript
- Tailwind CSS 4
- Vite 7

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

This project follows Feature-Sliced Design (FSD) architecture:

```text
src/
├── app/          # App entry point, providers, routing
├── pages/        # Page components
├── widgets/      # Complex UI blocks (family tree graph)
├── features/     # User interactions (add person, edit person)
├── entities/     # Business entities (person, family)
├── shared/       # Shared utilities, UI components, lib
└── data/         # Data files
```

## License

MIT
