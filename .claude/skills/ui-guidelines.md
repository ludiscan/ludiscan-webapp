# UI Guidelines Skill

You are helping with UI development for the ludiscan-webapp project. Follow these guidelines strictly to maintain consistency and code quality.

## Styling System

### Core Principles

1. **ALWAYS use Emotion styled components - NEVER use inline HTML tags**
   - ✅ Good: `const StyledDiv = styled.div`...` or `const StyledButton = styled(Component)`...`
   - ❌ Bad: `<div style={{...}}>`

2. **Access theme via useSharedTheme() hook**
   ```tsx
   import { useSharedTheme } from '@src/hooks/useSharedTheme';

   const Component = () => {
     const { theme } = useSharedTheme();
     return <Text color={theme.colors.text.primary} />
   }
   ```

3. **Use theme tokens, not hardcoded values**
   - ✅ Good: `theme.colors.primary.main`, `theme.spacing.md`, `theme.typography.fontSize.base`
   - ❌ Bad: `#C41E3A`, `16px`, `1rem`

### Component Styling Pattern

Always follow this pattern for styled components:

```tsx
import styled from '@emotion/styled';
import type { FC } from 'react';

type MyComponentProps = {
  className?: string;
  // ... other props
};

// Base component - handles logic
const Component: FC<MyComponentProps> = ({ className, ...props }) => {
  return <div className={className}>...</div>;
};

// Styled wrapper - handles styling
export const MyComponent = styled(Component)`
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.surface.base};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borders.radius.md};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface.hover};
  }
`;
```

## Theme System

### Available Theme Tokens

**Colors** (access via `theme.colors.*`)
- `primary.{main, dark, light, contrast}`
- `secondary.{main, dark, light, contrast}`
- `tertiary.{main, dark, light, contrast}`
- `background.{default, paper, elevated, overlay}`
- `surface.{base, raised, sunken, interactive, hover, pressed}`
- `text.{primary, secondary, tertiary, disabled, inverse, link, linkHover}`
- `border.{subtle, default, strong, interactive, focus}`
- `semantic.{success, warning, error, info}.{main, light, dark, contrast}`
- `effects.{shimmer, glow, shadow, highlight}`

**Typography** (access via `theme.typography.*`)
- Font sizes: `fontSize.{xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl}`
  - xs: 0.75rem (12px)
  - sm: 0.875rem (14px)
  - base: 1rem (16px)
  - lg: 1.125rem (18px)
  - xl: 1.25rem (20px)
  - 2xl: 1.5rem (24px)
  - 3xl: 1.875rem (30px)
  - 4xl: 2.25rem (36px)
  - 5xl: 3rem (48px)
- Font weights: `fontWeight.{light, regular, medium, semibold, bold, extrabold}`
  - light: 300
  - regular: 400
  - medium: 500
  - semibold: 600
  - bold: 700
  - extrabold: 800
- Line heights: `lineHeight.{tight, normal, relaxed, loose}`
- Letter spacing: `letterSpacing.{tight, normal, wide}`
- Font families: `fontFamily.{primary, secondary, monospace}`

**Spacing** (access via `theme.spacing.*`)
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)
- 4xl: 6rem (96px)

**Borders** (access via `theme.borders.*`)
- Radius: `radius.{none, sm, md, lg, xl, full}`
- Width: `width.{thin, default, thick}`

**Shadows** (access via `theme.shadows.*`)
- `sm, md, lg, xl, inner, glow, primary`

**Gradients** (access via `theme.gradients.*`)
- `primary, secondary, sunset, dusk, radial, shimmer`

### Legacy Constants (DEPRECATED - DO NOT USE)

The following are deprecated and should not be used in new code:
- `fontSizes` from `@src/styles/style.ts` (use `theme.typography.fontSize` instead)
- `fontWeights` from `@src/styles/style.ts` (use `theme.typography.fontWeight` instead)
- `colors` from `@src/styles/style.ts` (use `theme.colors` instead)

**Still valid legacy constants:**
- `zIndexes` - Z-index layering values
- `dimensions` - Layout dimensions (sidebar width, header height, etc.)
- `layers` - Three.js render layers

## Component Architecture

### Atomic Design Structure

```
src/component/
  ├── atoms/         # Basic building blocks (Button, Text, Flex, etc.)
  ├── molecules/     # Simple combinations (TextField, Modal, Menu, etc.)
  ├── organisms/     # Complex components (Sidebar, Toolbar, etc.)
  └── templates/     # Page layouts
```

**When to use each level:**
- **Atoms**: Single-purpose, no internal composition (Button, Text, Divider)
- **Molecules**: 2-3 atoms combined (TextField = Text label + input, Modal = header + content + footer)
- **Organisms**: Multiple molecules or complex logic (ProjectList, HeatmapViewer controls)
- **Templates**: Full page layouts with slots for content

### Component File Organization

```tsx
// MyComponent.tsx
import styled from '@emotion/styled';
import type { FC } from 'react';

// 1. Type definitions
export type MyComponentProps = {
  className?: string;
  scheme: 'primary' | 'secondary';
  children: ReactNode;
};

// 2. Helper functions (if needed)
const getBackgroundColor = (scheme: string, theme: Theme) => {
  return scheme === 'primary' ? theme.colors.primary.main : theme.colors.secondary.main;
};

// 3. Base component
const Component: FC<MyComponentProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

// 4. Styled export
export const MyComponent = styled(Component)`
  background-color: ${({ theme, scheme }) => getBackgroundColor(scheme, theme)};
`;
```

### Storybook Stories (Optional but Recommended)

Create `.stories.tsx` files for visual documentation:

```tsx
// MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Atoms/MyComponent',
  component: MyComponent,
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Primary: Story = {
  args: {
    scheme: 'primary',
    children: 'Primary Button',
  },
};
```

## Common UI Patterns

### Layout Components

Use existing flex utilities instead of creating custom layouts:

```tsx
import { FlexRow, FlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';

// Row layout
<FlexRow gap={16} align="center">
  <Button />
  <Button />
</FlexRow>

// Column layout
<FlexColumn gap={8} align="flex-start">
  <Text />
  <Text />
</FlexColumn>
```

### Buttons

Always use the Button component with proper scheme:

```tsx
import { Button } from '@src/component/atoms/Button';

<Button
  scheme="primary"    // primary | surface | warning | error | secondary | tertiary | none
  fontSize="base"     // xs | sm | base | lg | xl | 2xl | 3xl | 4xl | 5xl
  width="fit-content" // fit-content | full
  radius="default"    // default | small
  onClick={handleClick}
>
  Click me
</Button>
```

### Text

Use the Text component for consistent typography:

```tsx
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

const MyComponent = () => {
  const { theme } = useSharedTheme();

  return (
    <Text
      text="Hello World"
      fontSize={theme.typography.fontSize.lg}
      fontWeight={theme.typography.fontWeight.bold}
      color={theme.colors.text.primary}
    />
  );
};
```

### Modals

Use the Modal component for overlays:

```tsx
import { Modal } from '@src/component/molecules/Modal';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="My Modal"
  closeOutside={true}
>
  <Content />
</Modal>
```

### Forms

Use TextField and TextArea for inputs:

```tsx
import { TextField } from '@src/component/molecules/TextField';

<TextField
  value={value}
  onChange={setValue}
  label="Username"
  placeholder="Enter username"
  type="text"
/>
```

## Best Practices

### 1. Component Props

- Always include `className?: string` for styled component compatibility
- Use discriminated unions for variant props (scheme, size, etc.)
- Prefer specific types over generic ones

```tsx
// ✅ Good
type ButtonProps = {
  className?: string;
  scheme: 'primary' | 'secondary';
  onClick: () => void;
};

// ❌ Bad
type ButtonProps = {
  style?: CSSProperties;  // Avoid - use styled components
  variant?: string;        // Too generic
};
```

### 2. Event Handlers

- Name handlers with `handle` prefix: `handleClick`, `handleChange`
- Use `useCallback` for handlers passed to child components
- Stop propagation when needed (especially in nested interactive elements)

```tsx
const handleClick = useCallback((e: React.MouseEvent) => {
  e.stopPropagation();
  // ... handle click
}, [dependencies]);
```

### 3. Responsive Design

- Use `useIsDesktop()` hook for responsive logic
- Mobile breakpoint: 768px (from `dimensions.mobileWidth`)
- Consider using `ResponsiveSidebar` for adaptive layouts

```tsx
import { useIsDesktop } from '@src/hooks/useIsDesktop';

const MyComponent = () => {
  const isDesktop = useIsDesktop();

  return isDesktop ? <DesktopView /> : <MobileView />;
};
```

### 4. Icons

- Use `react-icons` library (already installed)
- Wrap icons in `IconContext.Provider` for consistent sizing
- Common icon libraries: `io5` (Ionicons 5), `fa` (Font Awesome)

```tsx
import { IoCloseOutline } from 'react-icons/io5';
import { IconContext } from 'react-icons';

<IconContext.Provider value={{ size: '24px' }}>
  <IoCloseOutline />
</IconContext.Provider>
```

### 5. Accessibility

- Always include semantic HTML where appropriate
- Add `title` prop to buttons for tooltips
- Use proper ARIA labels when needed
- Ensure proper color contrast (theme already optimized)

### 6. Performance

- Memoize expensive components with `React.memo`
- Use `useCallback` for event handlers in lists
- Avoid inline style objects (use styled components)

## React Best Practices

### useEffect Usage

**DO NOT overuse useEffect.** It should only be used for synchronizing with external systems (APIs, browser APIs, third-party libraries), not for orchestrating data flow.

#### ❌ BAD: Using useEffect only to update state

```tsx
// Anti-pattern: useEffect only updating state based on props
const Component = ({ userId }: Props) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // This is unnecessary - just derive the value!
    const foundUser = users.find(u => u.id === userId);
    setUser(foundUser);
  }, [userId]);

  return <div>{user?.name}</div>;
};
```

#### ✅ GOOD: Derive state during render

```tsx
// Better: Calculate during render (no useEffect needed)
const Component = ({ userId }: Props) => {
  const user = users.find(u => u.id === userId);

  return <div>{user?.name}</div>;
};
```

#### ❌ BAD: Cascading useEffects

```tsx
// Anti-pattern: Chain of useEffects updating each other
const Component = () => {
  const [data, setData] = useState(null);
  const [filtered, setFiltered] = useState(null);
  const [sorted, setSorted] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  useEffect(() => {
    if (data) {
      setFiltered(data.filter(item => item.active));
    }
  }, [data]);

  useEffect(() => {
    if (filtered) {
      setSorted([...filtered].sort());
    }
  }, [filtered]);

  return <List items={sorted} />;
};
```

#### ✅ GOOD: Single useEffect with derived state

```tsx
// Better: One useEffect for data fetching, derive the rest
const Component = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  // Derive during render - no extra useEffects needed
  const filtered = data?.filter(item => item.active) ?? [];
  const sorted = [...filtered].sort();

  return <List items={sorted} />;
};
```

#### ✅ GOOD: Valid useEffect use cases

```tsx
// Valid: Synchronizing with external API
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData);

  return () => controller.abort(); // Cleanup
}, []);

// Valid: Subscribing to external event
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, []);

// Valid: Synchronizing with third-party library
useEffect(() => {
  const map = new MapLibrary('#map');
  map.setCenter(coordinates);

  return () => map.destroy();
}, [coordinates]);
```

### State Management Principles

#### 1. Avoid Redundant State

Don't store values in state that can be calculated from existing state or props.

```tsx
// ❌ BAD: Redundant state
const Component = ({ items }: Props) => {
  const [items, setItems] = useState(items);
  const [itemCount, setItemCount] = useState(items.length); // Redundant!

  const addItem = (item) => {
    setItems([...items, item]);
    setItemCount(items.length + 1); // Can get out of sync!
  };
};

// ✅ GOOD: Derive count
const Component = ({ items }: Props) => {
  const [items, setItems] = useState(items);
  const itemCount = items.length; // Always in sync

  const addItem = (item) => {
    setItems([...items, item]);
  };
};
```

#### 2. Keep State Minimal

Only store the minimal state needed. Derive everything else.

```tsx
// ❌ BAD: Storing derived values
const Component = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState(''); // Redundant!

  const updateFirstName = (name) => {
    setFirstName(name);
    setFullName(`${name} ${lastName}`); // Easy to forget!
  };
};

// ✅ GOOD: Derive fullName
const Component = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const fullName = `${firstName} ${lastName}`; // Always correct
};
```

#### 3. Avoid State Mirroring Props

Don't copy props to state unless you specifically need to "disconnect" from the prop updates.

```tsx
// ❌ BAD: Mirroring props in state
const Component = ({ initialValue }: Props) => {
  const [value, setValue] = useState(initialValue); // Won't update if prop changes!

  return <input value={value} onChange={e => setValue(e.target.value)} />;
};

// ✅ GOOD: Use prop directly or controlled component
const Component = ({ value, onChange }: Props) => {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
};

// ✅ ALSO GOOD: If you truly need "initial value" behavior, be explicit
const Component = ({ initialValue }: Props) => {
  // Key changes when you want to reset - makes intent clear
  const [value, setValue] = useState(initialValue);

  return <input value={value} onChange={e => setValue(e.target.value)} />;
};
```

### useMemo and useCallback

**Only use when necessary.** Don't premature optimize.

#### When to use useMemo

```tsx
// ✅ GOOD: Expensive calculation
const Component = ({ items }: Props) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // Complex sorting logic
      return expensiveCompare(a, b);
    });
  }, [items]);
};

// ❌ BAD: Simple calculation (no need for useMemo)
const Component = ({ a, b }: Props) => {
  const sum = useMemo(() => a + b, [a, b]); // Overkill!
};

// ✅ GOOD: Just calculate directly
const Component = ({ a, b }: Props) => {
  const sum = a + b;
};
```

#### When to use useCallback

```tsx
// ✅ GOOD: Passed to memoized child component
const Parent = () => {
  const handleClick = useCallback(() => {
    // handle click
  }, []);

  return <MemoizedChild onClick={handleClick} />; // Prevents re-render
};

// ❌ BAD: Not passed to any component
const Component = () => {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // Unnecessary!

  return <div onClick={handleClick}>Click me</div>;
};

// ✅ GOOD: Just use regular function
const Component = () => {
  const handleClick = () => {
    console.log('clicked');
  };

  return <div onClick={handleClick}>Click me</div>;
};
```

### Component Organization

#### 1. Keep Components Small and Focused

```tsx
// ❌ BAD: Too many responsibilities
const UserProfile = () => {
  // 500 lines of code handling:
  // - User data fetching
  // - Profile editing
  // - Avatar upload
  // - Settings management
  // - Notifications
};

// ✅ GOOD: Split into focused components
const UserProfile = () => {
  return (
    <FlexColumn>
      <UserAvatar />
      <UserInfo />
      <UserSettings />
      <UserNotifications />
    </FlexColumn>
  );
};
```

#### 2. Extract Complex Logic to Custom Hooks

```tsx
// ❌ BAD: Logic mixed in component
const Component = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // ... lots of JSX
};

// ✅ GOOD: Extract to custom hook
const useData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};

const Component = () => {
  const { data, loading, error } = useData();

  // Clean, focused JSX
};
```

### Props and Context

#### 1. Avoid Prop Drilling

```tsx
// ❌ BAD: Passing through many levels
const App = () => {
  const [user, setUser] = useState(null);
  return <Dashboard user={user} />;
};

const Dashboard = ({ user }) => <Sidebar user={user} />;
const Sidebar = ({ user }) => <UserMenu user={user} />;
const UserMenu = ({ user }) => <UserAvatar user={user} />;

// ✅ GOOD: Use Context or Redux
const App = () => {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
};

const UserAvatar = () => {
  const { user } = useAuth(); // Direct access
};
```

#### 2. Use Composition Over Props

```tsx
// ❌ BAD: Boolean props for variations
const Modal = ({ showHeader, showFooter, title, actions }) => {
  return (
    <div>
      {showHeader && <Header title={title} />}
      <Content />
      {showFooter && <Footer actions={actions} />}
    </div>
  );
};

// ✅ GOOD: Use composition with children
const Modal = ({ children }) => {
  return <div>{children}</div>;
};

// Usage
<Modal>
  <Modal.Header title="My Modal" />
  <Modal.Content>...</Modal.Content>
  <Modal.Footer>...</Modal.Footer>
</Modal>
```

### Lists and Keys

#### Always use stable, unique keys

```tsx
// ❌ BAD: Using index as key
items.map((item, index) => <Item key={index} {...item} />);

// ❌ BAD: Using random values
items.map(item => <Item key={Math.random()} {...item} />);

// ✅ GOOD: Using stable unique ID
items.map(item => <Item key={item.id} {...item} />);

// ✅ GOOD: Combining fields if no ID exists
items.map(item => <Item key={`${item.name}-${item.timestamp}`} {...item} />);
```

### Common React Anti-Patterns to Avoid

1. ❌ **Don't mutate state directly**
   ```tsx
   // Bad
   state.items.push(newItem);
   setState(state);

   // Good
   setState({ ...state, items: [...state.items, newItem] });
   ```

2. ❌ **Don't use setState in render**
   ```tsx
   // Bad - infinite loop!
   const Component = () => {
     const [count, setCount] = useState(0);
     setCount(count + 1); // Never do this!
   };
   ```

3. ❌ **Don't forget cleanup in useEffect**
   ```tsx
   // Bad - memory leak!
   useEffect(() => {
     const interval = setInterval(() => {}, 1000);
     // Missing cleanup!
   }, []);

   // Good
   useEffect(() => {
     const interval = setInterval(() => {}, 1000);
     return () => clearInterval(interval);
   }, []);
   ```

4. ❌ **Don't create components inside components**
   ```tsx
   // Bad - recreated on every render!
   const Parent = () => {
     const Child = () => <div>Child</div>;
     return <Child />;
   };

   // Good - define outside
   const Child = () => <div>Child</div>;
   const Parent = () => <Child />;
   ```

## Z-Index Layering

Use predefined z-index values from `@src/styles/style.ts`:

```tsx
import { zIndexes } from '@src/styles/style';

const StyledModal = styled.div`
  z-index: ${zIndexes.modal};  // 200
`;

// Available layers:
// content: 0
// header: 100
// sidebar: 150
// modal: 200
// dropdown: 300
// tooltip: 400
// loader: 500
// toast: 600
```

## Common Mistakes to Avoid

### Styling Mistakes

1. ❌ Don't use inline styles: `<div style={{color: 'red'}}>`
2. ❌ Don't hardcode colors: `background: #C41E3A`
3. ❌ Don't use deprecated constants: `fontSizes.large1`
4. ❌ Don't forget className prop in component definitions
5. ❌ Don't mix styled components with plain HTML: `const Div = styled.div` then `<div>` instead of `<Div>`
6. ❌ Don't create custom layout components when Flex utilities exist
7. ❌ Don't access theme without useSharedTheme() hook

### React Mistakes

8. ❌ Don't overuse useEffect - use derived state for calculations
9. ❌ Don't create useEffect chains - derive in render instead
10. ❌ Don't store redundant state - calculate from existing state/props
11. ❌ Don't mirror props in state - use controlled components
12. ❌ Don't use index as key in lists
13. ❌ Don't create components inside components
14. ❌ Don't forget cleanup functions in useEffect
15. ❌ Don't mutate state directly - always create new objects/arrays
16. ❌ Don't call setState during render - infinite loop!
17. ❌ Don't overuse useMemo/useCallback - only optimize when needed

## Quick Reference Checklist

Before submitting a PR with UI changes, verify:

**Styling:**
- [ ] All styling uses Emotion styled components (no inline styles)
- [ ] Theme tokens used instead of hardcoded values
- [ ] `useSharedTheme()` hook used to access theme
- [ ] Z-index uses predefined values
- [ ] No deprecated constants used (fontSizes, fontWeights, colors from style.ts)

**Component Structure:**
- [ ] Component follows atomic design principles
- [ ] Props include `className?: string`
- [ ] TypeScript types are properly defined
- [ ] Components are small and focused (single responsibility)
- [ ] Complex logic extracted to custom hooks
- [ ] Storybook story created (if new component)

**React Best Practices:**
- [ ] No overuse of useEffect (only for external system synchronization)
- [ ] No useEffect chains - use derived state instead
- [ ] No redundant state - derive values when possible
- [ ] State is minimal and normalized
- [ ] No prop mirroring in state (unless intentional)
- [ ] useMemo/useCallback only used when necessary
- [ ] Event handlers use useCallback only when passed to memoized children
- [ ] List items have stable, unique keys (not index or random values)
- [ ] No components defined inside components
- [ ] All useEffect hooks have proper cleanup

**General:**
- [ ] Responsive design considered (mobile/desktop)
- [ ] Icons sized consistently
- [ ] Accessibility requirements met
- [ ] No prop drilling (use Context/Redux when needed)

## Examples

### Creating a New Atom Component

```tsx
// src/component/atoms/Badge.tsx
import styled from '@emotion/styled';
import type { FC } from 'react';

export type BadgeProps = {
  className?: string;
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info';
};

const Component: FC<BadgeProps> = ({ className, label }) => {
  return <span className={className}>{label}</span>;
};

export const Badge = styled(Component)`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border-radius: ${({ theme }) => theme.borders.radius.full};

  background-color: ${({ theme, variant }) => theme.colors.semantic[variant].main};
  color: ${({ theme, variant }) => theme.colors.semantic[variant].contrast};
`;
```

### Creating a New Molecule Component

```tsx
// src/component/molecules/LabeledInput.tsx
import styled from '@emotion/styled';
import type { FC } from 'react';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { TextField } from '@src/component/molecules/TextField';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type LabeledInputProps = {
  className?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

const Component: FC<LabeledInputProps> = ({
  className,
  label,
  value,
  onChange,
  required
}) => {
  const { theme } = useSharedTheme();

  return (
    <FlexColumn className={className} gap={4}>
      <Text
        text={`${label}${required ? ' *' : ''}`}
        fontSize={theme.typography.fontSize.sm}
        fontWeight={theme.typography.fontWeight.medium}
        color={theme.colors.text.secondary}
      />
      <TextField
        value={value}
        onChange={onChange}
      />
    </FlexColumn>
  );
};

export const LabeledInput = styled(Component)`
  width: 100%;
`;
```

---

**Remember**: Consistency is key. When in doubt, look at existing components in the same category (atoms/molecules/organisms) for reference patterns.
