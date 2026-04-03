# 🤖 Agent Instructions — DineFlow Platform

This document provides essential context and constraints for any AI agent or developer working on the DineFlow codebase.

---

## Project Overview

**DineFlow** is a circular-economy restaurant management platform. It is a **pure client-side React app** — there is no live backend. All data is mocked in `src/data/mockData.ts` and managed via `AppContext`.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Router DOM v6 · Radix UI / shadcn components · Lucide React icons · Recharts · Sonner toasts

---

## Architecture Constraints

### 1. Role-Based Access Control (RBAC)
Every page is protected by `<ProtectedRoute allowedRoles={[...]}>`. Roles are: `admin`, `chef`, `waiter`, `customer`.

| Route | Allowed Roles |
|---|---|
| `/admin` | admin |
| `/kitchen` | admin, chef |
| `/waste` | admin, chef |
| `/floor` | admin, waiter |
| `/menu` | admin, customer |

> **Agent Rule:** When adding a new page, always wrap it in `<ProtectedRoute>` in `App.tsx` and add it to the `navItems` filter in `NavigationPill.tsx`.

### 2. Global State via AppContext
**Never create local state for data that is shared across pages.** All cross-page data lives in `src/contexts/AppContext.tsx`.

Currently managed globally:
- `userRole` — active role / login state
- `wasteLogs` / `addWasteLog` — waste tracking
- `cart` / `addToCart` / `updateCartQty` / `clearCart` — customer order cart
- `ecoPoints` / `addEcoPoints` — customer eco-points
- `flashSaleActive` / `toggleFlashSale` — flash sale toggle state (keyed by item ID)
- `tablesState` / `setTablesState` / `resetAllTables` — floor table status

> **Agent Rule:** If you need cross-page state, add it to `AppContext` — do not use prop drilling or duplicate state.

### 3. No Backend — Mock Data Only
All data lives in `src/data/mockData.ts`. There is a `TODO` comment in `AdminDashboard.tsx` for a future Django backend connection for supplier fetching.

> **Agent Rule:** Do not add real API calls. Use the existing mock data. If adding new mock data, define TypeScript interfaces alongside it in `mockData.ts`.

### 4. Styling: Tailwind CSS (Light Mode for Kitchen/Waste)
- Admin Dashboard, Floor Map: uses CSS variables (`bg-background`, `text-foreground`, `border-border`) for theme-aware dark/light support via shadcn.
- Kitchen Panel & Waste Management: uses explicit Tailwind light-mode classes (`bg-gray-50`, `text-gray-900`, `border-gray-200`).

> **Agent Rule:** Do not mix shadcn CSS variables with explicit gray classes in the same component. Match the pattern of the page you're editing.

### 5. Navigation
The `NavigationPill` role-filter must be updated whenever a new route is added:

```typescript
// NavigationPill.tsx
if (userRole === "chef" && (item.to === "/kitchen" || item.to === "/waste")) return true;
```

> **Agent Rule:** When adding a new page, update both `App.tsx` (route) and `NavigationPill.tsx` (nav item + role filter) in the same change.

---

## File Ownership Map

| File | Purpose |
|---|---|
| `src/App.tsx` | Router, route definitions, ProtectedRoute |
| `src/components/NavigationPill.tsx` | Bottom navigation bar with role filtering |
| `src/contexts/AppContext.tsx` | Global state provider |
| `src/data/mockData.ts` | All mock data + TypeScript interfaces |
| `src/pages/AdminDashboard.tsx` | Admin-only, multi-view (dashboard, suppliers, inventory, settings) |
| `src/pages/KitchenPanel.tsx` | Chef/Admin, tabbed (live orders + prep sheet) |
| `src/pages/WasteManagement.tsx` | Chef/Admin, waste log form + feed |
| `src/pages/FloorMap.tsx` | Waiter/Admin, table grid + alerts |
| `src/pages/CustomerMenu.tsx` | Customer, menu ordering + eco receipt |
| `src/pages/Index.tsx` | Landing page, role selector |
| `src/pages/NotFound.tsx` | 404 fallback |
| `public/favicon.png` | DineFlow custom favicon (green leaf/plate) |
| `workflow.md` | Development workflow documentation |
| `wireframe.md` | Full UI wireframe for all screens |

---

## Do's and Don'ts

### ✅ DO
- Use `useApp()` hook to access global state
- Use `lucide-react` for all icons
- Use `sonner` (`toast.success / toast.error`) for user feedback
- Keep pages in `src/pages/`, shared components in `src/components/`
- Use TypeScript — define interfaces for all data structures
- Match the light/dark theme pattern of the page you're editing

### ❌ DON'T
- Add real API calls (no `fetch` / `axios` to external endpoints)
- Bypass `ProtectedRoute` when adding new pages
- Duplicate state that already exists in `AppContext`
- Install new icon libraries (use `lucide-react`)
- Add CSS files — use Tailwind utilities only
- Mix shadcn CSS variables (`bg-background`) with explicit color classes (`bg-gray-50`) in the same component

---

## Common Patterns

### Adding a new page
1. Create `src/pages/MyPage.tsx`
2. Import and add route in `src/App.tsx` with `ProtectedRoute`
3. Add nav item to `navItems` array in `NavigationPill.tsx`
4. Add role filter condition in the `filteredNavItems` filter

### Adding global state
1. Add state and handler to `AppContext.tsx`
2. Export the type from `AppContextType`
3. Access via `const { myState } = useApp()` in any component

### Adding mock data
1. Define the TypeScript interface in `mockData.ts`
2. Export the mock array/object
3. Import in the relevant page

---

## Dev Commands
```bash
npm install       # Install dependencies
npm run dev       # Start dev server (http://localhost:8080)
npm run test      # Run Vitest unit tests
npm run lint      # ESLint check
npm run build     # Production build → dist/
```
