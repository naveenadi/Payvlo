# Project Plan: Payvlo - GST Invoice Generator

## 📋 Project Outline
**Cross-Platform Invoice Generator for Indian GST Compliance**
- **Phase 1**: Project Setup & Foundation (Week 1)
- **Phase 2**: Core GST Engine & Database Schema (Week 2) 
- **Phase 3**: Frontend Development & UI (Week 3-4)
- **Phase 4**: Desktop Integration & PDF Generation (Week 5)
- **Phase 5**: Testing & Compliance Validation (Week 6)
- **Phase 6**: Packaging & Deployment (Week 7)

## 🎯 Goals

### **Primary Goal**: GST-Compliant Invoice System
Build a lightweight, cross-platform invoice generator that handles Indian GST calculations, generates compliant PDFs, and works seamlessly as both web and desktop application.

### **Technical Goals**:
- **🏗️ Architecture**: SvelteKit + Tauri + SQLite for optimal performance
- **📱 Cross-Platform**: Windows, macOS, Linux desktop + web deployment
- **📊 GST Compliance**: CGST, SGST, IGST calculations with HSN/SAC codes
- **📄 PDF Generation**: Professional, GST-compliant invoice templates
- **💾 Data Management**: Local SQLite with optional cloud sync

### **Performance Targets**:
- App size: < 5MB
- Memory usage: < 100MB idle
- Startup time: < 1 second
- PDF generation: < 2 seconds per invoice

## 📝 Notes
**Key Constraints & Decisions**:
- **GST Compliance**: Must follow CBIC guidelines for invoice format
- **Offline-First**: Primary SQLite storage for reliability
- **Lightweight Focus**: Prioritize performance over feature richness
- **User Experience**: Simple, intuitive interface for small business owners
- **Tech Stack Rationale**: Tauri provides native performance with web tech flexibility

**Indian GST Requirements**:
- Business registration details (GSTIN)
- HSN/SAC product codes
- CGST, SGST, IGST tax calculations
- Sequential invoice numbering
- Digital signature support
- Statutory compliance fields

## ✅ Tasks List

### 🎯 Phase 1: Project Setup & Foundation
- [x] 🔴 Set up SvelteKit project with TypeScript (@dev, 0.5d) ✅
- [x] 🔴 Initialize Tauri integration (@dev, 0.5d) ✅
- [x] 🔴 Configure development environment (Rust, Node.js, pnpm) (@dev, 0.5d) ✅
- [x] 🔴 Set up project structure and folder organization (@dev, 0.5d) ✅
- [ ] 🟡 Configure ESLint, Prettier, and development tools (@dev, 0.5d)
- [ ] 🟡 Set up Git repository and initial CI/CD pipeline (@dev, 0.5d)

### 🎯 Phase 2: Core GST Engine & Database Schema
- [ ] 🔴 Design SQLite database schema for invoices, customers, products (@dev, 1d)
  - [ ] Customer table (GSTIN, address, contact details)
  - [ ] Product table (HSN/SAC, tax rates, descriptions)
  - [ ] Invoice table (header, line items, tax calculations)
  - [ ] Company settings table (business details, GSTIN)
- [ ] 🔴 Implement GST calculation engine (@dev, 2d)
  - [ ] CGST/SGST for intra-state transactions
  - [ ] IGST for inter-state transactions  
  - [ ] Tax slab management (5%, 12%, 18%, 28%)
  - [ ] HSN/SAC code validation
- [ ] 🟡 Create data access layer with Rust backend (@dev, 1d)
- [ ] 🟡 Implement basic CRUD operations (@dev, 1d)

### 🎯 Phase 3: Frontend Development & UI
- [ ] 🔴 Set up Skeleton UI component library (@dev, 0.5d)
- [ ] 🔴 Create main application layout and navigation (@dev, 1d)
- [ ] 🔴 Build customer management interface (@dev, 2d)
  - [ ] Customer registration form with GSTIN validation
  - [ ] Customer list and search functionality
- [ ] 🔴 Build product/service management interface (@dev, 2d)
  - [ ] Product catalog with HSN/SAC codes
  - [ ] Tax rate configuration
- [ ] 🔴 Create invoice generation form (@dev, 3d)
  - [ ] Dynamic line item addition
  - [ ] Real-time GST calculation
  - [ ] Invoice preview
- [ ] 🟡 Implement invoice management dashboard (@dev, 2d)
  - [ ] Invoice listing and search
  - [ ] Status tracking (draft, sent, paid)
- [ ] 🟡 Add form validation using svelte-forms-lib (@dev, 1d)

### 🎯 Phase 4: Desktop Integration & PDF Generation
- [ ] 🔴 Integrate jsPDF for invoice PDF generation (@dev, 2d)
  - [ ] GST-compliant invoice template
  - [ ] Company letterhead and branding
  - [ ] Tax summary sections
- [ ] 🔴 Implement native file operations via Tauri (@dev, 1d)
  - [ ] Save PDF to user-selected location
  - [ ] Import/export data functionality
- [ ] 🟡 Add digital signature support for PDFs (@dev, 1d)
- [ ] 🟡 Implement batch PDF generation (@dev, 1d)
- [ ] 🟡 Create backup and restore functionality (@dev, 1d)

### 🎯 Phase 5: Testing & Compliance Validation
- [ ] 🔴 Set up Vitest and Svelte Testing Library (@dev, 0.5d)
- [ ] 🔴 Write unit tests for GST calculation engine (@dev, 1d)
- [ ] 🔴 Test GST compliance scenarios (@dev, 1d)
  - [ ] Intra-state vs inter-state calculations
  - [ ] Different tax slabs and exemptions
  - [ ] Invoice numbering and format validation
- [ ] 🟡 Integration testing for Tauri APIs (@dev, 1d)
- [ ] 🟡 End-to-end testing for critical workflows (@dev, 1d)
- [ ] 🟡 Performance testing and optimization (@dev, 1d)

### 🎯 Phase 6: Packaging & Deployment
- [ ] 🔴 Configure Tauri bundling for all platforms (@dev, 1d)
  - [ ] Windows MSI installer
  - [ ] macOS DMG package
  - [ ] Linux AppImage
- [ ] 🟡 Set up GitHub Actions for automated builds (@dev, 1d)
- [ ] 🟡 Create web deployment pipeline (@dev, 0.5d)
- [ ] 🟡 Write user documentation and setup guide (@dev, 1d)
- [ ] 🟡 Prepare release packages and distribution (@dev, 0.5d)

## 👥 Resources
| Phase | Owner | Estimated Time | Dependencies | Priority |
|-------|--------|-----------------|--------------|----------|
| Phase 1: Setup | @dev | 3d | - | High |
| Phase 2: GST Engine | @dev | 5d | Phase 1 | High |
| Phase 3: Frontend | @dev | 10d | Phase 2 | High |
| Phase 4: Desktop/PDF | @dev | 5d | Phase 3 | High |
| Phase 5: Testing | @dev | 4.5d | Phase 4 | Medium |
| Phase 6: Packaging | @dev | 4d | Phase 5 | Medium |

**Total Estimated Time**: ~31.5 days (6-7 weeks)
**Critical Path**: Setup → GST Engine → Frontend → Desktop/PDF
**Resource Allocation**: Single developer with full-stack capabilities

## 📊 Progress
**Current Phase**: Phase 1 - Project Setup & Foundation (67% Complete)
**Completion**: 4/6 Phase 1 tasks completed
**Next Milestone**: Complete Phase 1, Start Phase 2 - GST Engine Development
**Estimated Project Completion**: 7 weeks from start

## 🎯 Current Goal
**Active Focus**: Complete Phase 1 and begin GST calculation engine development
**Immediate Next Steps**:
1. Configure development tools (ESLint, Prettier, Vitest)
2. Set up Git repository and initial CI/CD pipeline  
3. Design SQLite database schema for GST compliance

**Success Criteria for Current Phase**:
- [x] SvelteKit app runs in development mode ✅
- [x] Tauri desktop app launches successfully ✅
- [x] Development environment is fully configured ✅
- [x] Initial project structure is established ✅

## 🤖 AI Suggestions Log
- [Today]: Initial project structure based on lightweight tech stack recommendation
- [Today]: Prioritized GST compliance as core technical requirement
- [Today]: Estimated 6-7 week timeline based on feature complexity
- [Today]: Restructured project - moved all files from app/ to root directory for simplified development workflow

## 📈 Revision History
- [Today]: Project initiated with comprehensive phase-based breakdown
- [Today]: Tech stack confirmed: SvelteKit + Tauri + SQLite + jsPDF

## 🎉 Milestone Celebrations & Retrospectives
*Milestone achievements will be tracked here as the project progresses*

## 🔗 Code Integration Links
- **Main Branch**: *To be created*
- **Feature Branches**: *To be created during development*  
- **Documentation**: *To be created*
- **Tests**: *To be created* 