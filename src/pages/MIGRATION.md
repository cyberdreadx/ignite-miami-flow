# Pages Migration Guide

This guide helps you update imports and routes after the pages directory reorganization.

## 📋 Import Migration

### OLD IMPORTS (Before reorganization)
```typescript
// Old flat structure imports
import Admin from '@/pages/Admin';
import AdminAnalytics from '@/pages/AdminAnalytics';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Tickets from '@/pages/Tickets';
import MyTickets from '@/pages/MyTickets';
import Index from '@/pages/Index';
import About from '@/pages/About';
```

### NEW IMPORTS (Organized structure)

#### Option 1: Category-based imports (Recommended)
```typescript
import { Admin, AdminAnalytics } from '@/pages/admin';
import { Auth } from '@/pages/auth';
import { Profile } from '@/pages/user';
import { Tickets, MyTickets } from '@/pages/tickets';
import { Index, About } from '@/pages/public';
```

#### Option 2: Direct file imports
```typescript
import Admin from '@/pages/admin/Admin';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import Auth from '@/pages/auth/Auth';
import Profile from '@/pages/user/Profile';
import Tickets from '@/pages/tickets/Tickets';
import MyTickets from '@/pages/tickets/MyTickets';
import Index from '@/pages/public/Index';
import About from '@/pages/public/About';
```

## 🗺️ Router Configuration Updates

### OLD Router Setup
```typescript
// Before - flat structure
import Admin from '@/pages/Admin';
import AdminAnalytics from '@/pages/AdminAnalytics';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Tickets from '@/pages/Tickets';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

const routes = [
  { path: '/', component: Index },
  { path: '/auth', component: Auth },
  { path: '/admin', component: Admin },
  { path: '/admin/analytics', component: AdminAnalytics },
  { path: '/profile', component: Profile },
  { path: '/tickets', component: Tickets },
  { path: '*', component: NotFound },
];
```

### NEW Router Setup
```typescript
// After - organized structure
import { Index, About, NotFound } from '@/pages/public';
import { Auth } from '@/pages/auth';
import { Admin, AdminAnalytics, AdminDiagnostics } from '@/pages/admin';
import { Profile, Members, Affiliate } from '@/pages/user';
import { Tickets, MyTickets, ValidateTicket } from '@/pages/tickets';

const routes = [
  // Public routes
  { path: '/', component: Index },
  { path: '/about', component: About },
  
  // Auth routes
  { path: '/auth', component: Auth },
  
  // User routes
  { path: '/profile', component: Profile },
  { path: '/members', component: Members },
  { path: '/affiliate', component: Affiliate },
  
  // Ticket routes
  { path: '/tickets', component: Tickets },
  { path: '/my-tickets', component: MyTickets },
  { path: '/validate-ticket', component: ValidateTicket },
  
  // Admin routes
  { path: '/admin', component: Admin },
  { path: '/admin/analytics', component: AdminAnalytics },
  { path: '/admin/diagnostics', component: AdminDiagnostics },
  
  // Fallback
  { path: '*', component: NotFound },
];
```

## 🔄 Step-by-Step Migration

### 1. Update Main Router File
```typescript
// src/App.tsx or src/router.tsx
// Replace old imports with new organized imports
```

### 2. Update Navigation Components
```typescript
// Update any navigation components that reference page routes
// Example: NavBar.tsx, AdminSidebar.tsx, etc.
```

### 3. Update Component Imports
```typescript
// Update any components that import pages directly
// Search for: '@/pages/' and update paths
```

### 4. Update Lazy Loading
```typescript
// OLD lazy loading
const Admin = lazy(() => import('@/pages/Admin'));

// NEW lazy loading
const Admin = lazy(() => import('@/pages/admin/Admin'));
// OR
const AdminPages = lazy(() => import('@/pages/admin'));
```

### 5. Update Route Guards
```typescript
// Update any route protection that references page paths
const AdminRoute = ({ children }) => {
  // Implementation using new admin page structure
};
```

## 🔍 Find & Replace Patterns

Use these patterns for bulk updates:

### VS Code Find & Replace
```
Find: '@/pages/Admin'
Replace: '@/pages/admin/Admin'

Find: '@/pages/Auth'
Replace: '@/pages/auth/Auth'

Find: '@/pages/Profile'
Replace: '@/pages/user/Profile'

Find: '@/pages/Tickets'
Replace: '@/pages/tickets/Tickets'

Find: '@/pages/Index'
Replace: '@/pages/public/Index'
```

### Search for All Page Imports
```bash
# Find all files that import pages
grep -r "@/pages/" src/
```

## ✅ Migration Checklist

### Router Updates
- [ ] Update main router configuration
- [ ] Update lazy loading imports
- [ ] Update route guards and protection
- [ ] Test all routes work correctly

### Component Updates
- [ ] Update navigation component imports
- [ ] Update any direct page imports in components
- [ ] Update breadcrumb components
- [ ] Update any page references in utilities

### Testing
- [ ] Test public routes work
- [ ] Test authentication flow
- [ ] Test user-protected routes
- [ ] Test admin-protected routes
- [ ] Test ticket system pages
- [ ] Test 404 handling

### Optimization Opportunities
- [ ] Implement category-based lazy loading
- [ ] Add route-based code splitting
- [ ] Optimize bundle sizes per user type
- [ ] Add preloading for related page categories

## 🚀 Advanced Optimizations

### Bundle Splitting by Category
```typescript
// Optimize loading for different user types
const publicBundle = () => import('@/pages/public');
const userBundle = () => import('@/pages/user');
const adminBundle = () => import('@/pages/admin');
```

### Route-Based Code Splitting
```typescript
// Split bundles by route categories
const routes = [
  {
    path: '/admin/*',
    component: lazy(() => import('@/pages/admin')),
  },
  {
    path: '/user/*',
    component: lazy(() => import('@/pages/user')),
  },
];
```

This migration will significantly improve your application's organization and maintainability! 🎉