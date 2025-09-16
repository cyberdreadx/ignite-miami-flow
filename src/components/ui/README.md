# UI Components Library

This directory contains a well-organized collection of reusable UI components, structured by functionality for better maintainability and developer experience.

## 📁 Directory Structure

```
ui/
├── layout/           # Layout & Structure Components
├── forms/            # Form & Input Components  
├── navigation/       # Navigation & Menu Components
├── feedback/         # Feedback & Status Components
├── overlays/         # Modal & Overlay Components
├── data-display/     # Data Presentation Components
├── utilities/        # Utility & Helper Components
└── index.ts          # Main export file
```

## 🧩 Component Categories

### 📐 Layout Components (`/layout`)
Components that help structure and organize page layouts:
- **Card** - Content containers with headers, bodies, and footers
- **Separator** - Visual dividers between content sections
- **Aspect Ratio** - Maintain consistent aspect ratios
- **Resizable** - Resizable panels and containers
- **Scroll Area** - Custom scrollable areas
- **Sidebar** - Navigation sidebars

### 📝 Form Components (`/forms`)
Interactive form elements and inputs:
- **Button** - Clickable action buttons with variants
- **Input** - Text input fields
- **Textarea** - Multi-line text input
- **Checkbox** - Boolean selection checkboxes
- **Radio Group** - Single selection from options
- **Select** - Dropdown selection menus
- **Slider** - Range selection sliders
- **Switch** - Toggle switches
- **Label** - Form field labels
- **Form** - Form validation and structure
- **Input OTP** - One-time password inputs

### 🧭 Navigation Components (`/navigation`)
Components for site navigation and organization:
- **Breadcrumb** - Navigation breadcrumbs
- **Tabs** - Tabbed content organization
- **Menu Bar** - Horizontal menu bars
- **Navigation Menu** - Complex navigation menus
- **Pagination** - Page navigation controls

### 💬 Feedback Components (`/feedback`)
User feedback and status indicators:
- **Alert** - Important messages and notifications
- **Toast** - Temporary notification messages
- **Progress** - Progress indicators and loading states
- **Skeleton** - Loading placeholders
- **Sonner** - Advanced toast notifications

### 🔗 Overlay Components (`/overlays`)
Modal dialogs and floating elements:
- **Dialog** - Modal dialogs and popups
- **Alert Dialog** - Confirmation dialogs
- **Popover** - Floating content containers
- **Tooltip** - Hover information tooltips
- **Dropdown Menu** - Context menus and dropdowns
- **Sheet** - Slide-out panels
- **Drawer** - Mobile-friendly slide panels
- **Hover Card** - Rich hover content
- **Command** - Command palette interfaces
- **Context Menu** - Right-click menus

### 📊 Data Display Components (`/data-display`)
Components for presenting data and information:
- **Table** - Data tables with sorting and filtering
- **Avatar** - User profile images
- **Badge** - Status indicators and labels
- **Calendar** - Date selection and display
- **Chart** - Data visualization charts
- **Carousel** - Image and content carousels

### 🔧 Utility Components (`/utilities`)
Helper components for common patterns:
- **Accordion** - Collapsible content sections
- **Collapsible** - Show/hide content areas
- **Toggle** - Binary state toggles
- **Toggle Group** - Grouped toggle selections

## 📦 Import Patterns

### Individual Component Imports (Recommended)
```typescript
// Import specific components by category
import { Card, CardContent, CardHeader } from '@/components/ui/layout';
import { Button, Input, Label } from '@/components/ui/forms';
import { Dialog, DialogContent } from '@/components/ui/overlays';
```

### Category Imports
```typescript
// Import entire categories
import * as Layout from '@/components/ui/layout';
import * as Forms from '@/components/ui/forms';
```

### Legacy Imports (Backward Compatibility)
```typescript
// Old import style still works
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
```

### Barrel Imports
```typescript
// Import from main barrel export
import { Card, Button, Dialog } from '@/components/ui';
```

## 🎯 Benefits of This Organization

1. **Better Discoverability** - Easy to find components by purpose
2. **Improved Maintainability** - Related components grouped together
3. **Cleaner Imports** - Import only what you need from specific categories
4. **Better Documentation** - Clear categorization helps with documentation
5. **Scalability** - Easy to add new components to appropriate categories
6. **Developer Experience** - Faster development with organized structure

## 🔄 Migration Guide

If you're updating existing imports, you can:

1. **Use the new category imports** for better organization
2. **Keep existing imports** - they still work via the main index.ts
3. **Gradually migrate** to the new structure over time

## 🚀 Usage Examples

```tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout';
import { Button, Input, Label } from '@/components/ui/forms';
import { Alert, AlertDescription } from '@/components/ui/feedback';

export function ExampleComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <Button>Submit</Button>
          <Alert>
            <AlertDescription>
              Please fill out all required fields.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
```

This organization makes the UI library more professional, maintainable, and developer-friendly!