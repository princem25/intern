# InternAI - React Migration

This project has been migrated from a static HTML/CSS site to a React Single Page Application (SPA) using Vite.

## Project Structure

- `src/components`: Reusable UI components and Layouts.
- `src/pages`: Application pages grouped by role (Intern, Lead, HR).
- `src/data`: Mock data and navigation configuration.
- `src/index.css`: Global styles and Tailwind-like utility classes.
- `legacy_backup`: Original HTML files.

## Getting Started

### Prerequisites

- Node.js installed.

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Troubleshooting

### PowerShell "Script Disabled" Error

If you see an error like `cannot be loaded because running scripts is disabled on this system` when running `npm` commands in PowerShell on Windows:

**Option 1: Use Command Prompt (cmd)**
Run the commands in a standard Command Prompt (cmd.exe) window instead of PowerShell.

**Option 2: Bypass in PowerShell**
Prefix your command with `cmd /c`:

```powershell
cmd /c npm run dev
```

**Option 3: Change Execution Policy (Advanced)**
Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
