# Payvlo - Complete Development Guide

> **GST-Compliant Invoice Generator for Indian Businesses**  
> Built with SvelteKit + Tauri + SQLite for cross-platform excellence

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Quick Start](#-quick-start)
3. [Architecture](#-architecture)
4. [Development Environment](#-development-environment)
5. [GST Compliance](#-gst-compliance)
6. [Code Structure](#-code-structure)
7. [Development Workflow](#-development-workflow)
8. [Testing Strategy](#-testing-strategy)
9. [Build & Deployment](#-build--deployment)
10. [Contributing](#-contributing)
11. [Troubleshooting](#-troubleshooting)

## 🎯 Project Overview

Payvlo is a lightweight, cross-platform invoice generator specifically designed for Indian businesses requiring GST compliance. Built for small to medium medical equipment retailers, it provides professional invoice generation with automatic GST calculations.

### Key Features

- **📊 GST Compliance**: CGST, SGST, IGST calculations with HSN/SAC codes
- **🖥️ Cross-Platform**: Native desktop apps + web deployment
- **📄 Professional PDFs**: GST-compliant invoice templates
- **💾 Offline-First**: Local SQLite database with optional cloud sync
- **⚡ Lightweight**: < 5MB app size, < 100MB memory usage
- **🚀 Fast**: < 1 second startup, < 2 seconds PDF generation

### Target Users

- Small medical equipment retailers
- GST-registered businesses in India
- Businesses requiring professional invoice generation
- Users needing offline-capable accounting solutions

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+ 
- **Rust**: Latest stable (for Tauri)
- **pnpm**: Package manager
- **Git**: Version control

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Payvlo

# Install dependencies
pnpm install

# Install Rust dependencies
cargo install tauri-cli

# Start development
pnpm run dev        # Web development
pnpm tauri dev     # Desktop development
```

### First Run

1. **Web Application**: Open http://localhost:5173
2. **Desktop Application**: Will launch automatically with `pnpm tauri dev`
3. **Initial Setup**: Configure your business details and GSTIN

## 🏗️ Architecture

### Technology Stack

```
Frontend: SvelteKit + TypeScript
├── UI Framework: Skeleton UI + Tailwind CSS
├── State Management: Svelte Stores
├── Form Handling: svelte-forms-lib
└── PDF Generation: jsPDF

Backend: Tauri + Rust
├── Database: SQLite
├── File System: Native APIs
├── GST Engine: Custom Rust Implementation
└── Business Logic: Tauri Commands

Build System: Vite + Tauri CLI
├── Development: Hot reload + Fast refresh
├── Testing: Vitest + Playwright
└── Packaging: Native installers for all platforms
```

### Application Architecture

```
📦 Payvlo
├── 🎨 Frontend (SvelteKit)
│   ├── User Interface Components
│   ├── State Management (Svelte Stores)
│   ├── Form Handling & Validation
│   └── PDF Generation (jsPDF)
├── ⚙️ Backend (Tauri + Rust)
│   ├── Database Operations (SQLite)
│   ├── GST Calculation Engine
│   ├── File System Access
│   └── Business Logic APIs
└── 💾 Data Layer
    ├── SQLite Database
    ├── Local File Storage
    └── Configuration Management
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| App Size | < 5MB | TBD |
| Memory Usage | < 100MB | TBD |
| Startup Time | < 1 second | TBD |
| PDF Generation | < 2 seconds | TBD |

## 💻 Development Environment

### Recommended IDE Setup

1. **Visual Studio Code** with extensions:
   - Svelte for VS Code
   - Rust Analyzer
   - Tauri
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter

2. **Alternative**: Any editor with TypeScript and Rust support

### Development Commands

```bash
# Development
pnpm run dev          # Start SvelteKit dev server
pnpm tauri dev       # Start Tauri desktop app in dev mode
pnpm run build       # Build for production
pnpm tauri build     # Build desktop app for production

# Testing
pnpm test            # Run all tests
pnpm test:watch      # Run tests in watch mode
pnpm test:coverage   # Generate coverage report

# Code Quality
pnpm lint            # ESLint + Prettier
pnpm format          # Format code
pnpm type-check      # TypeScript type checking

# Database
pnpm db:migrate      # Run database migrations
pnpm db:seed         # Seed development data
pnpm db:reset        # Reset database
```

### Environment Variables

```bash
# Development
NODE_ENV=development
DATABASE_URL=./data/payvlo.db
LOG_LEVEL=debug

# Production
NODE_ENV=production
DATABASE_URL=./data/payvlo.db
LOG_LEVEL=info
```

## 📊 GST Compliance

### Indian GST System Overview

The Goods and Services Tax (GST) system in India requires specific calculations and invoice formats:

#### Tax Structure

- **CGST**: Central GST (for intra-state transactions)
- **SGST**: State GST (for intra-state transactions) 
- **IGST**: Integrated GST (for inter-state transactions)

#### Tax Slabs

| Rate | Items |
|------|-------|
| 0% | Essential goods |
| 5% | Daily necessities |
| 12% | Processed food items |
| 18% | Most goods and services |
| 28% | Luxury items |

### Implementation Requirements

#### Mandatory Invoice Fields

```typescript
interface GSTInvoice {
  // Business Details
  gstin: string;              // GST Identification Number
  businessName: string;
  businessAddress: Address;
  
  // Customer Details
  customerGstin?: string;     // Optional for B2C
  customerName: string;
  customerAddress: Address;
  
  // Invoice Details
  invoiceNumber: string;      // Sequential numbering
  invoiceDate: Date;
  placeOfSupply: string;      // State code
  
  // Line Items
  items: InvoiceItem[];       // Products/services
  
  // Tax Calculations
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  grandTotal: number;
}
```

#### HSN/SAC Codes

- **HSN**: Harmonized System of Nomenclature (for goods)
- **SAC**: Services Accounting Code (for services)
- Required for all items with specific tax rates

### GST Calculation Logic

```typescript
// GST calculation implementation
function calculateGST(items: InvoiceItem[], placeOfSupply: string, businessState: string) {
  const isInterState = placeOfSupply !== businessState;
  
  for (const item of items) {
    const taxableAmount = item.quantity * item.rate;
    const taxRate = item.gstRate;
    
    if (isInterState) {
      // Inter-state: IGST only
      item.igst = taxableAmount * (taxRate / 100);
      item.cgst = 0;
      item.sgst = 0;
    } else {
      // Intra-state: CGST + SGST
      item.cgst = taxableAmount * (taxRate / 200); // Half of total rate
      item.sgst = taxableAmount * (taxRate / 200); // Half of total rate
      item.igst = 0;
    }
  }
}
```

## 📁 Code Structure

### Frontend Structure (src/)

```
src/
├── 📱 app.html              # Main HTML template
├── 📱 app.d.ts              # Global type definitions
├── 📂 lib/                  # Shared utilities
│   ├── 🔧 utils/           # Helper functions
│   ├── 🏪 stores/          # Svelte stores
│   ├── 🧩 components/      # Reusable components
│   ├── 🎯 types/           # TypeScript types
│   └── 🔌 api/             # API client functions
└── 📂 routes/              # SvelteKit routes
    ├── 📄 +page.svelte     # Home page
    ├── 📂 customers/       # Customer management
    ├── 📂 products/        # Product catalog
    ├── 📂 invoices/        # Invoice generation
    └── 📂 settings/        # Application settings
```

### Backend Structure (src-tauri/)

```
src-tauri/
├── 📄 Cargo.toml           # Rust dependencies
├── 📄 tauri.conf.json      # Tauri configuration
├── 📂 src/                 # Rust source code
│   ├── 📄 main.rs          # Application entry point
│   ├── 📄 lib.rs           # Library root
│   ├── 📂 commands/        # Tauri commands
│   ├── 📂 database/        # Database operations
│   ├── 📂 gst/             # GST calculation engine
│   └── 📂 utils/           # Utility functions
└── 📂 icons/               # Application icons
```

### Key Components

#### 1. Database Schema

```sql
-- Customers table
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    gstin TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    hsn_sac_code TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    gst_rate DECIMAL(5,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    invoice_date DATE NOT NULL,
    place_of_supply TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    cgst_amount DECIMAL(10,2) NOT NULL,
    sgst_amount DECIMAL(10,2) NOT NULL,
    igst_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Invoice Items table
CREATE TABLE invoice_items (
    id INTEGER PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    gst_rate DECIMAL(5,2) NOT NULL,
    cgst_amount DECIMAL(10,2) NOT NULL,
    sgst_amount DECIMAL(10,2) NOT NULL,
    igst_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### 2. GST Engine (Rust)

```rust
// src-tauri/src/gst/calculator.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GSTCalculation {
    pub taxable_amount: f64,
    pub cgst: f64,
    pub sgst: f64,
    pub igst: f64,
    pub total_tax: f64,
    pub total_amount: f64,
}

pub struct GSTCalculator;

impl GSTCalculator {
    pub fn calculate(
        amount: f64,
        gst_rate: f64,
        is_inter_state: bool,
    ) -> GSTCalculation {
        let total_tax = amount * (gst_rate / 100.0);
        
        if is_inter_state {
            GSTCalculation {
                taxable_amount: amount,
                cgst: 0.0,
                sgst: 0.0,
                igst: total_tax,
                total_tax,
                total_amount: amount + total_tax,
            }
        } else {
            let cgst = total_tax / 2.0;
            let sgst = total_tax / 2.0;
            
            GSTCalculation {
                taxable_amount: amount,
                cgst,
                sgst,
                igst: 0.0,
                total_tax,
                total_amount: amount + total_tax,
            }
        }
    }
}
```

## 🔄 Development Workflow

### Branch Strategy

```
main
├── develop
├── feature/customer-management
├── feature/gst-calculator
├── feature/pdf-generation
└── release/v1.0.0
```

### Commit Convention

```bash
feat: add customer GSTIN validation
fix: resolve GST calculation for inter-state transactions
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add unit tests for GST calculator
chore: update dependencies
```

### Development Process

1. **Feature Development**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   # Develop feature
   git add .
   git commit -m "feat: implement new feature"
   git push origin feature/new-feature
   # Create pull request
   ```

2. **Code Review Checklist**
   - [ ] Code follows TypeScript/Rust best practices
   - [ ] GST calculations are accurate
   - [ ] Tests pass and coverage is adequate
   - [ ] Documentation is updated
   - [ ] Performance requirements are met
   - [ ] Security considerations addressed

## 🧪 Testing Strategy

### Testing Pyramid

```
🔺 E2E Tests (Playwright)
   - Complete invoice generation workflow
   - PDF generation and download
   - Cross-platform compatibility

🔺🔺 Integration Tests (Vitest)
     - Database operations
     - Tauri command testing
     - API endpoint testing

🔺🔺🔺 Unit Tests (Vitest + Jest)
       - GST calculation engine
       - Utility functions
       - Component logic
       - Form validation
```

### Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
});
```

## 🚀 Build & Deployment

### Build Process

#### Development Build

```bash
# Web application
pnpm run build
pnpm run preview

# Desktop application  
pnpm tauri build --debug
```

#### Production Build

```bash
# Web application
NODE_ENV=production pnpm run build

# Desktop application (all platforms)
pnpm tauri build

# Platform-specific builds
pnpm tauri build --target x86_64-pc-windows-msvc    # Windows
pnpm tauri build --target x86_64-apple-darwin       # macOS Intel
pnpm tauri build --target aarch64-apple-darwin      # macOS Apple Silicon
pnpm tauri build --target x86_64-unknown-linux-gnu  # Linux
```

### Deployment Targets

#### 1. Desktop Applications

| Platform | Format | Location |
|----------|--------|----------|
| Windows | MSI Installer | `src-tauri/target/release/bundle/msi/` |
| macOS | DMG Package | `src-tauri/target/release/bundle/dmg/` |
| Linux | AppImage | `src-tauri/target/release/bundle/appimage/` |

#### 2. Web Application

```bash
# Static site generation
pnpm run build
# Output: build/ directory

# Deploy to Vercel/Netlify
pnpm run deploy
```

## 👥 Contributing

### Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/payvlo.git
   cd payvlo
   ```
3. **Install dependencies**
   ```bash
   pnpm install
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Code Style

```typescript
// TypeScript/JavaScript
// Use descriptive variable names
const customerGstinNumber = 'GSTIN123456';

// Use TypeScript interfaces
interface Customer {
  id: number;
  name: string;
  gstin?: string;
  address: Address;
}

// Use async/await over promises
async function fetchCustomers(): Promise<Customer[]> {
  try {
    const response = await api.get('/customers');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    throw error;
  }
}
```

```rust
// Rust
use serde::{Deserialize, Serialize};

// Use descriptive struct names
#[derive(Debug, Serialize, Deserialize)]
pub struct InvoiceItem {
    pub product_id: i64,
    pub quantity: f64,
    pub rate: f64,
    pub gst_rate: f64,
}

// Use proper error handling
pub fn calculate_gst(amount: f64, rate: f64) -> Result<f64, String> {
    if rate < 0.0 || rate > 100.0 {
        return Err("GST rate must be between 0 and 100".to_string());
    }
    
    Ok(amount * (rate / 100.0))
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures

**Issue**: `error: could not find 'Cargo.toml'`
```bash
# Solution: Ensure you're in the correct directory
cd path/to/payvlo
ls -la  # Should see Cargo.toml in src-tauri/
```

**Issue**: `Error: Cannot find module '@tauri-apps/api'`
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
pnpm install
```

#### 2. Development Server Issues

**Issue**: SvelteKit dev server not starting
```bash
# Solution: Check port availability
lsof -i :5173
kill -9 <PID>  # If port is occupied
pnpm run dev
```

**Issue**: Tauri app not launching
```bash
# Solution: Check Rust installation
rustc --version
cargo --version

# Reinstall if needed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Debug Mode

Enable debug logging:

```bash
# Environment variable
DEBUG=payvlo:* pnpm run dev

# Or in code
console.debug('GST calculation debug:', {
  amount,
  rate,
  isInterState,
  result
});
```

### Getting Help

1. **Check existing issues**: GitHub Issues tab
2. **Search documentation**: This guide and API docs
3. **Community Discord**: [Link to Discord]
4. **Stack Overflow**: Tag with `payvlo` and `tauri`
5. **Create new issue**: With detailed information

---

## 📚 Additional Resources

- [Project Plan](../plan.md) - Detailed development roadmap
- [API Documentation](./api.md) - Tauri commands and endpoints
- [UI Components](./components.md) - Reusable component library
- [GST Compliance Guide](./gst-compliance.md) - Detailed GST requirements
- [Deployment Guide](./deployment.md) - Platform-specific deployment

---

**Happy coding! 🚀**

> For questions or support, please create an issue or reach out to the development team. 