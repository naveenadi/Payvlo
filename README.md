# Payvlo - GST Invoice Generator

A lightweight, cross-platform GST-compliant invoice generator for Indian businesses, built with SvelteKit + Tauri.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **Rust** (latest stable)
- **pnpm** (recommended package manager)

### Development Commands

```bash
# Start SvelteKit web development server
pnpm run dev

# Start Tauri desktop application (opens native window)
pnpm tauri dev

# Build for production
pnpm run build

# Build desktop application
pnpm tauri build
```

## 📁 Project Structure

```
Payvlo/
├── src/                    # SvelteKit source code
├── src-tauri/             # Tauri (Rust) backend
├── static/                # Static assets
├── package.json           # Node.js dependencies
├── tauri.conf.json        # Tauri configuration (in src-tauri/)
├── plan.md                # Development roadmap
├── GEMINI.md             # AI model documentation
└── README.md              # This file
```

## 🎯 Project Goals

- **📱 Cross-Platform**: Windows, macOS, Linux desktop + web
- **📊 GST Compliance**: CGST, SGST, IGST calculations with HSN/SAC codes
- **⚡ Performance**: <5MB app size, <100MB memory, <1s startup
- **💾 Offline-First**: SQLite local storage with optional cloud sync
- **📄 PDF Generation**: Professional, GST-compliant invoice templates

## 🏗️ Architecture

- **Frontend**: SvelteKit + TypeScript + Skeleton UI
- **Desktop**: Tauri (Rust) for native performance
- **Database**: SQLite for local storage
- **PDF**: jsPDF for invoice generation

## 📊 Development Progress

See [`plan.md`](plan.md) for detailed development phases and current status.

**Current Phase**: Phase 1 - Project Setup & Foundation (67% Complete)

## 🔧 Development Notes

- **Web Dev Server**: Runs on http://localhost:5173
- **Desktop App**: Tauri wraps the web app in a native window
- **Package Manager**: Use `pnpm` for faster installs
- **Directory**: All development commands run from the root directory

## 📋 Indian GST Requirements

- Business registration details (GSTIN)
- HSN/SAC product codes
- CGST/SGST for intra-state transactions
- IGST for inter-state transactions
- Tax slabs: 5%, 12%, 18%, 28%
- Sequential invoice numbering
- Digital signature support

## 🚀 Getting Started

1. **Install Dependencies**:

   ```bash
   pnpm install
   ```

2. **Start Development**:

   ```bash
   # For web development
   pnpm run dev

   # For desktop development
   pnpm tauri dev
   ```

3. **Build for Production**:
   ```bash
   pnpm run build && pnpm tauri build
   ```

## 📝 Next Steps

- Complete Phase 1: ESLint/Prettier setup
- Phase 2: GST calculation engine
- Phase 3: Frontend UI development
- Phase 4: PDF generation & desktop integration

---

Built with ❤️ for Indian businesses needing GST-compliant invoicing.
