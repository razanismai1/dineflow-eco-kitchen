---
description: DineFlow Project Workflow and Structure
---

# DineFlow — Circular Economy Restaurant Platform

This document outlines the project structure and the development workflow for the DineFlow platform.

## Project Structure Overview

```text
/
├── public/                 # Static assets (favicons, manifest, etc.)
├── src/                    # Core source code
│   ├── components/         # Reusable UI components (shadcn/ui + custom)
│   ├── contexts/           # Global State Management (AppContext)
│   ├── data/               # Mock data and TypeScript interfaces
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions (Tailwind merge, etc.)
│   ├── pages/              # View components for each route
│   │   ├── AdminDashboard.tsx
│   │   ├── KitchenPanel.tsx
│   │   ├── WasteManagement.tsx
│   │   └── ...
│   ├── App.tsx             # Main Routing and Providers
│   └── main.tsx            # Application entry point
├── package.json            # Scripts and dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS theme and plugins
└── tsconfig.json           # TypeScript configuration
```

## Development Workflow

### 1. Installation
Install project dependencies.
```bash
npm install
```

### 2. Development
Run the local development server.
```bash
npm run dev
```
The application will be available at `http://localhost:8080` (unless configured otherwise).

### 3. Testing
Run unit and integration tests using Vitest.
```bash
npm run test
```
To run tests in watch mode:
```bash
npm run test:watch
```

### 4. Linting
Check for code quality and style issues.
```bash
npm run lint
```

### 5. Production Build
Create a production-ready bundle.
```bash
npm run build
```
The output will be in the `dist/` directory.

### 6. Preview Production Build
Serve the production build locally for verification.
```bash
npm run preview
```

## Key Technologies
- **Framework**: React 18 (with Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router DOM (v6)
- **Testing**: Vitest + Playwright
- **Icons**: Lucide React
