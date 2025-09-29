# DentaLeague Design System

## Overview
This document outlines the design patterns, components, and styling conventions used throughout the DentaLeague application.

## Color System

### Role-Based Colors
All role-based colors are defined using semantic tokens and should be accessed via `src/lib/roleUtils.ts`:

- **Owner**: Blue (`bg-blue-50 text-blue-600 border-blue-100`)
- **Assistant**: Green (`bg-green-50 text-green-600 border-green-100`)
- **Front Desk**: Purple (`bg-purple-50 text-purple-600 border-purple-100`)
- **Admin**: Orange (`bg-orange-50 text-orange-600 border-orange-100`)

### Avatar Gradients
Role-based avatar gradients:
- **Owner**: `from-blue-500 to-indigo-600`
- **Assistant**: `from-green-500 to-emerald-600`
- **Front Desk**: `from-purple-500 to-violet-600`
- **Admin**: `from-orange-500 to-amber-600`

### Semantic Tokens
Use semantic color tokens from `index.css` instead of direct colors:
```css
/* Do this */
bg-background text-foreground border-border

/* Not this */
bg-white text-black border-gray-200
```

## Layout Patterns

### Dashboard Structure
All dashboards follow this consistent structure:

```tsx
<SidebarProvider defaultOpen={true}>
  <div className="min-h-screen w-full flex bg-gradient-to-br from-background via-background to-muted/20">
    <[Role]Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        {/* Header content */}
      </header>
      <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
        {/* Main content */}
      </main>
    </div>
  </div>
</SidebarProvider>
```

### Header Pattern
```tsx
<header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
  <div className="flex items-center gap-2 sm:gap-4 h-12 sm:h-14 px-2 sm:px-4">
    <SidebarTrigger className="md:hidden" />
    {/* Context title */}
    <div className="flex items-center gap-1.5 min-w-0 flex-1">
      {/* Icon and title */}
    </div>
    {/* Right: Role Switcher & User Menu */}
    <div className="flex items-center gap-2">
      <RoleSwitcher {...props} />
      {/* User dropdown */}
    </div>
  </div>
</header>
```

## Component Patterns

### Sidebar Navigation
- Width expanded: Flexible based on content
- Width collapsed: `w-14`
- Icon size: `w-4 h-4` or `w-5 h-5`
- Active state: `bg-blue-500 text-white` (for owner), theme-appropriate for other roles
- Hover state: `hover:bg-muted/50`

### Badges
Use the `getRoleBadgeStyle()` utility from `src/lib/roleUtils.ts`:

```tsx
import { getRoleBadgeStyle } from '@/lib/roleUtils';

<Badge variant="secondary" className={getRoleBadgeStyle(role)}>
  {roleLabel}
</Badge>
```

### Avatars
Use the `getRoleAvatarGradient()` utility:

```tsx
import { getRoleAvatarGradient } from '@/lib/roleUtils';

<AvatarFallback className={`bg-gradient-to-br ${getRoleAvatarGradient(role)} text-white`}>
  {initials}
</AvatarFallback>
```

### Role Switcher
Always include when user has multiple roles:

```tsx
<RoleSwitcher 
  currentRole={role}
  availableRoles={userProfile?.roles || [role]}
  userProfile={userProfile}
  variant="dropdown"
/>
```

## Spacing Scale

- Extra small: `gap-1` (4px), `p-1` (4px)
- Small: `gap-2` (8px), `p-2` (8px)
- Medium: `gap-4` (16px), `p-4` (16px)
- Large: `gap-6` (24px), `p-6` (24px)
- Extra large: `gap-8` (32px), `p-8` (32px)

### When to Use
- `gap-1`: Tight icon+text pairings
- `gap-2`: Related elements within a component
- `gap-4`: Between distinct UI elements
- `gap-6`: Between card sections
- `gap-8`: Between major page sections

## Typography

### Headings
- H1: `text-2xl font-bold` (page titles)
- H2: `text-xl font-semibold` (section headers)
- H3: `text-lg font-medium` (subsection headers)

### Body Text
- Default: `text-sm` (14px)
- Small: `text-xs` (12px)
- Large: `text-base` (16px)

### Font Weights
- Regular: `font-normal` (400)
- Medium: `font-medium` (500)
- Semibold: `font-semibold` (600)
- Bold: `font-bold` (700)

## Button Variants

Use semantic button variants:
- `default`: Primary actions
- `secondary`: Secondary actions
- `outline`: Tertiary actions
- `ghost`: Minimal actions (navigation, dropdowns)
- `destructive`: Delete/remove actions

## Cards

Standard card pattern:
```tsx
<Card className="bg-card border shadow-sm">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## Authentication Pages

Auth pages use a simplified theme:
- Background: `bg-gradient-to-br from-background via-background to-muted/20`
- Header: `bg-background/80 backdrop-blur-sm`
- Cards: `bg-card/80 backdrop-blur-sm border shadow-lg`

## Responsive Design

### Breakpoints
- Mobile: `< 640px` (default)
- Tablet: `sm: >= 640px`
- Desktop: `md: >= 768px`
- Large Desktop: `lg: >= 1024px`
- Extra Large: `xl: >= 1280px`

### Common Patterns
```tsx
// Hide on mobile, show on desktop
className="hidden lg:block"

// Different sizes on mobile vs desktop
className="w-6 h-6 sm:w-8 sm:h-8"

// Different padding on mobile vs desktop
className="p-2 sm:p-4 lg:p-6"
```

## Accessibility

- All interactive elements have proper hover states
- Icons include proper aria-labels
- Focus states are visible
- Color is not the only indicator of state
- Text has sufficient contrast ratios

## Best Practices

1. **Always use semantic tokens** from the design system
2. **Prefer utility functions** over hardcoded values (roleUtils.ts)
3. **Keep components focused** - break large components into smaller ones
4. **Use consistent spacing** - follow the spacing scale
5. **Make it responsive** - test on mobile, tablet, and desktop
6. **Maintain theme consistency** - use the established patterns
7. **Document departures** - if you need to break a pattern, document why

## Future Enhancements

- [ ] Add shared DashboardLayout wrapper component
- [ ] Create Storybook for component documentation
- [ ] Add dark mode support
- [ ] Expand color system for more use cases
- [ ] Create more reusable compound components
