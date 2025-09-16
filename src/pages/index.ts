// Pages Library - Organized Structure
//
// This is the main entry point for all pages in the organized structure.
// Pages are now categorized by functionality and user access level.
//
// For detailed documentation, see: ./README.md
// For migration guide, see: ./MIGRATION.md

// Re-export all page categories (excluding public due to filename conflicts)
export * from './admin';
export * from './auth';
export * from './user';
export * from './tickets';
// export * from './public';  // Commented out due to Index.tsx casing conflict
export * from './testing';