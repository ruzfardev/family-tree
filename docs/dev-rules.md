# Development Rules

## UntitledUI Component Library

**Always use existing UntitledUI components - do not create custom UI components.**

### Available Components

| Category | Components |
|----------|------------|
| **Base** | Avatar, Badges, Button, ButtonGroup, Checkbox, Dropdown, Input, Select, Slider, Tags, Textarea, Toggle, Tooltip, RadioButtons, PinInput, ProgressIndicators |
| **Application** | Modal, SlideoutMenu, Table, Tabs, Pagination, DatePicker, FileUpload, EmptyState, LoadingIndicator, Navigation (Sidebar/Header) |
| **Foundations** | FeaturedIcon, Logo, SocialIcons, PaymentIcons, RatingBadge, RatingStars |

### Import Paths

```tsx
// Base components
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Avatar } from '@/components/base/avatar/avatar';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Toggle } from '@/components/base/toggle/toggle';
import { Checkbox } from '@/components/base/checkbox/checkbox';

// Application components
import { Modal } from '@/components/application/modals/modal';
import { SlideoutMenu } from '@/components/application/slideout-menus/slideout-menu';
import { Tabs } from '@/components/application/tabs/tabs';

// Foundations
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
```

### Icons

Use `@untitledui/icons` package:

```tsx
import { User01, Plus, Minus, ZoomIn, ZoomOut } from '@untitledui/icons';
```

---

## Architecture: Feature-Sliced Design (FSD)

```
src/
├── app/                    # App-level setup (providers, routing, global styles)
│   ├── providers/
│   ├── routes/
│   └── index.tsx
│
├── pages/                  # Page components (compose widgets/features)
│   └── family-tree/
│       └── index.tsx
│
├── widgets/                # Complex UI blocks (combine features + entities)
│   └── family-tree-graph/
│       ├── ui/
│       ├── model/
│       └── index.ts
│
├── features/               # User interactions (actions, forms)
│   ├── edit-person/
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts
│   ├── add-family-member/
│   └── layout-controls/
│
├── entities/               # Business entities (data models, entity cards)
│   ├── person/
│   │   ├── ui/             # PersonNode, CoupleNode
│   │   ├── model/          # types, selectors
│   │   └── index.ts
│   └── family/
│       ├── model/          # family data hook, storage
│       └── index.ts
│
├── shared/                 # Reusable code (no business logic)
│   ├── ui/                 # Generic UI components (buttons, inputs)
│   ├── lib/                # Utilities (dagre-layout, helpers)
│   ├── api/                # API layer (if needed)
│   ├── config/             # Constants, env
│   └── types/              # Shared TypeScript types
│
└── data/                   # Static data files
    └── family.json
```

## FSD Layer Rules

| Layer    | Can Import From                     |
|----------|-------------------------------------|
| app      | pages, widgets, features, entities, shared |
| pages    | widgets, features, entities, shared |
| widgets  | features, entities, shared          |
| features | entities, shared                    |
| entities | shared                              |
| shared   | shared (internal only)              |

**Golden Rule:** Lower layers NEVER import from upper layers.

---

## DRY Principles

### 1. Single Source of Truth

- **Types**: Define once in `shared/types/` or `entities/*/model/`
- **Constants**: Define in `shared/config/`
- **Utilities**: Define in `shared/lib/`

### 2. Component Composition

```tsx
// BAD: Duplicating logic
function PersonNode() { /* formatting dates */ }
function CoupleNode() { /* same date formatting */ }

// GOOD: Extract to shared
// shared/lib/format-date.ts
export const formatDateRange = (birth?: string, death?: string) =>
  death ? `${birth} - ${death}` : birth ?? '';

// entities/person/ui/person-node.tsx
import { formatDateRange } from '@/shared/lib/format-date';
```

### 3. Avoid Prop Drilling

- Use React Context for cross-cutting concerns
- Place context in appropriate FSD layer:
  - App-wide state → `app/providers/`
  - Feature-specific → `features/*/model/`

### 4. Custom Hooks for Reusable Logic

```tsx
// BAD: Logic in component
function SidebarPanel() {
  const [data, setData] = useState(initialData);
  const updatePerson = (id, updates) => { /* ... */ };
  // ...
}

// GOOD: Extract to entity/feature model
// entities/family/model/use-family-data.ts
export function useFamilyData() {
  const [data, setData] = useState(initialData);
  const updatePerson = useCallback((id, updates) => { /* ... */ }, []);
  return { data, updatePerson };
}
```

---

## File Naming Conventions

| Type           | Convention               | Example                    |
|----------------|--------------------------|----------------------------|
| Components     | kebab-case.tsx           | `person-node.tsx`          |
| Hooks          | use-*.ts                 | `use-family-data.ts`       |
| Types          | *.types.ts or types.ts   | `person.types.ts`          |
| Utilities      | kebab-case.ts            | `dagre-layout.ts`          |
| Constants      | kebab-case.ts            | `graph-config.ts`          |
| Index exports  | index.ts                 | `index.ts`                 |

---

## Public API Pattern

Each slice should expose a public API via `index.ts`:

```ts
// entities/person/index.ts
export { PersonNode } from './ui/person-node';
export { CoupleNode } from './ui/couple-node';
export type { Person } from './model/types';
```

**Never import from internal paths:**

```tsx
// BAD
import { PersonNode } from '@/entities/person/ui/person-node';

// GOOD
import { PersonNode } from '@/entities/person';
```

---

## TypeScript Rules

1. **Explicit return types** for exported functions
2. **No `any`** - use `unknown` if type is truly unknown
3. **Prefer interfaces** for object shapes, types for unions/primitives
4. **Strict null checks** - handle undefined/null explicitly

---

## React Best Practices

1. **Memoize expensive computations** with `useMemo`
2. **Memoize callbacks** passed to children with `useCallback`
3. **Avoid inline objects/arrays** in JSX props (causes re-renders)
4. **Co-locate state** as close as possible to where it's used
5. **Prefer composition** over prop drilling

---

## Import Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Usage:

```tsx
import { PersonNode } from '@/entities/person';
import { formatDateRange } from '@/shared/lib/format-date';
```