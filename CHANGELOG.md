# Changelog

All notable changes to @markdownkit/remark-mdd.

## [2.2.3] - 2026-06-18

### Fixed

- **`./validator` is now browser/bundler-safe.** It loaded its JSON Schema via
  `fs.readFileSync(fileURLToPath(import.meta.url) + …)`, which threw on import/use in a browser or a
  Vite/esbuild renderer (no `node:fs`/`node:path`/`node:url`). The two schemas are now `import`ed
  statically (`with { type: 'json' }`, Node ≥24), so the validator has no `node:*` runtime dependency
  and runs identically in Node and the browser. Validation behaviour and the schema files shipped in
  the package are unchanged.

## [0.1.0] - 2025-10-18

### Added

- **Initial release** - Extracted from @markdownkit/mdd v0.0.7
- Core remark plugins:
  - `remark-mdd-document-structure` - Process semantic directives
  - `remark-mdd-text-formatting` - Handle professional typography
  - `remark-mdx-conditional` - Conditional MDX processing (experimental)
- Validation library:
  - `validator.js` - Document validation with JSON Schema
  - `plugin-validator.js` - Validation utilities for plugin development
- JSON Schemas:
  - `mdd-document.schema.json` - Complete document schema
  - `document-type-requirements.json` - Per-type requirements (54 types)
- TypeScript definitions:
  - Complete type definitions for all MDD structures
  - Plugin development types
  - Validation types
- Package exports:
  - Main export with all plugins
  - Individual plugin exports
  - Validator exports
  - Schema exports
  - TypeScript type exports

### Features

- Lightweight package (no CLI dependencies)
- Proper package exports for modern Node.js
- Peer dependency on remark (not bundled)
- Full TypeScript support
- JSON Schema for IDE integration
- Comprehensive documentation

### Migration

If you were using `@markdownkit/mdd` for plugins only:

**Before:**

```javascript
import { remarkMddDocumentStructure } from "@markdownkit/mdd";
// or
import remarkMddDocumentStructure from "@markdownkit/mdd/plugins/remark-mdd-document-structure.js";
```

**After:**

```javascript
import { remarkMddDocumentStructure } from "@markdownkit/remark-mdd";
// or
import remarkMddDocumentStructure from "@markdownkit/remark-mdd/plugins/document-structure";
```

### Breaking Changes

None - this is a new package extracted from the main MDD package.
