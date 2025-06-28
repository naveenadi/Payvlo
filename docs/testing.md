# Testing Guide - Payvlo GST Invoice Generator

**Last Updated**: 2025-06-28  
**Project Phase**: Phase 5 - Testing & Compliance Validation  
**Status**: Auto-generated from [plan.md](../plan.md)

## 📋 Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [GST Compliance Testing](#gst-compliance-testing)
6. [End-to-End Testing](#end-to-end-testing)
7. [Performance Testing](#performance-testing)
8. [Cross-Platform Testing](#cross-platform-testing)
9. [Test Automation](#test-automation)
10. [Quality Assurance Procedures](#quality-assurance-procedures)

## 🎯 Testing Strategy Overview

### **Testing Philosophy**

Ensure Payvlo delivers a reliable, GST-compliant invoice generator that performs consistently across all platforms while maintaining the target performance metrics.

### **Testing Pyramid**

```
         E2E Tests (10%)
    ┌─────────────────────┐
    │  User Workflows     │
    │  GST Compliance     │
    │  Cross-Platform     │
    └─────────────────────┘
      Integration Tests (30%)
  ┌─────────────────────────┐
  │   Tauri APIs           │
  │   Database Operations   │
  │   PDF Generation       │
  └─────────────────────────┘
        Unit Tests (60%)
┌─────────────────────────────┐
│     GST Calculations       │
│     Business Logic         │
│     Utility Functions      │
└─────────────────────────────┘
```

### **Quality Gates**

- **Code Coverage**: Minimum 80% for critical business logic
- **GST Compliance**: 100% compliance test pass rate
- **Performance**: All operations within target metrics
- **Cross-Platform**: Tests pass on Windows, macOS, Linux

## 🔧 Test Environment Setup

### **Testing Stack**

```json
{
	"frontend": {
		"runner": "Vitest",
		"library": "Svelte Testing Library",
		"mocking": "@vitest/spy",
		"coverage": "c8"
	},
	"backend": {
		"rust_testing": "cargo test",
		"integration": "tauri test",
		"mocking": "mockall"
	},
	"e2e": {
		"framework": "Playwright",
		"cross_platform": "GitHub Actions Matrix"
	}
}
```

### **Installation & Configuration**

**Frontend Testing Setup:**

```bash
# Install testing dependencies
pnpm add -D vitest @vitest/ui c8
pnpm add -D @testing-library/svelte @testing-library/jest-dom
pnpm add -D jsdom happy-dom

# Configure vitest.config.ts
export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

**Rust Testing Setup:**

```toml
# Cargo.toml testing dependencies
[dev-dependencies]
tokio-test = "0.4"
mockall = "0.11"
tempfile = "3.8"
rstest = "0.18"
```

## 🧪 Unit Testing

### **GST Calculation Engine Tests**

**Tax Calculation Logic:**

```typescript
// src/lib/gst/__tests__/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateGST, TaxType } from '../calculations';

describe('GST Calculations', () => {
	describe('Intra-state transactions (CGST + SGST)', () => {
		it('should calculate 18% GST correctly', () => {
			const result = calculateGST({
				amount: 1000,
				gstRate: 18,
				transactionType: TaxType.INTRA_STATE,
				buyerState: 'Maharashtra',
				sellerState: 'Maharashtra'
			});

			expect(result).toEqual({
				cgst: 90, // 9%
				sgst: 90, // 9%
				igst: 0,
				total: 180,
				taxableAmount: 1000,
				totalAmount: 1180
			});
		});
	});

	describe('Inter-state transactions (IGST)', () => {
		it('should calculate 18% IGST correctly', () => {
			const result = calculateGST({
				amount: 1000,
				gstRate: 18,
				transactionType: TaxType.INTER_STATE,
				buyerState: 'Maharashtra',
				sellerState: 'Karnataka'
			});

			expect(result).toEqual({
				cgst: 0,
				sgst: 0,
				igst: 180, // 18%
				total: 180,
				taxableAmount: 1000,
				totalAmount: 1180
			});
		});
	});

	describe('Tax slab validation', () => {
		it.each([
			[5, 50],
			[12, 120],
			[18, 180],
			[28, 280]
		])('should calculate %i% GST correctly', (rate, expected) => {
			const result = calculateGST({
				amount: 1000,
				gstRate: rate,
				transactionType: TaxType.INTRA_STATE,
				buyerState: 'Delhi',
				sellerState: 'Delhi'
			});

			expect(result.total).toBe(expected);
		});
	});
});
```

**GSTIN Validation Tests:**

```typescript
// src/lib/validation/__tests__/gstin.test.ts
import { validateGSTIN } from '../gstin';

describe('GSTIN Validation', () => {
	it('should validate correct GSTIN format', () => {
		const validGSTIN = '27AAPFU0939F1ZV';
		expect(validateGSTIN(validGSTIN)).toBe(true);
	});

	it('should reject invalid GSTIN format', () => {
		const invalidGSTINs = [
			'27AAPFU0939F1Z', // Too short
			'27AAPFU0939F1ZVV', // Too long
			'27AAPFU0939F1Z0', // Invalid checksum
			'INVALID_GSTIN' // Wrong format
		];

		invalidGSTINs.forEach((gstin) => {
			expect(validateGSTIN(gstin)).toBe(false);
		});
	});
});
```

### **Database Operations Tests**

**Rust Backend Tests:**

```rust
// src-tauri/src/database/tests.rs
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use tokio_test;

    #[tokio::test]
    async fn test_create_customer() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let db = Database::new(db_path.to_str().unwrap()).await.unwrap();

        let customer = CustomerData {
            name: "Test Customer".to_string(),
            gstin: "27AAPFU0939F1ZV".to_string(),
            address: "Test Address".to_string(),
            email: Some("test@example.com".to_string()),
            phone: Some("9876543210".to_string()),
        };

        let result = db.create_customer(customer).await;
        assert!(result.is_ok());

        let created_customer = result.unwrap();
        assert_eq!(created_customer.name, "Test Customer");
        assert!(created_customer.id > 0);
    }

    #[tokio::test]
    async fn test_gst_calculation_storage() {
        let temp_dir = tempdir().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let db = Database::new(db_path.to_str().unwrap()).await.unwrap();

        let invoice = InvoiceData {
            customer_id: 1,
            items: vec![
                InvoiceItem {
                    description: "Test Product".to_string(),
                    quantity: 2,
                    rate: 1000.0,
                    hsn_code: "1234".to_string(),
                    gst_rate: 18,
                }
            ],
            invoice_type: "INTRA_STATE".to_string(),
        };

        let result = db.create_invoice(invoice).await;
        assert!(result.is_ok());

        let created_invoice = result.unwrap();
        assert_eq!(created_invoice.total_amount, 2360.0); // 2000 + 360 GST
    }
}
```

## 🔗 Integration Testing

### **Tauri API Testing**

**Frontend-Backend Integration:**

```typescript
// src/lib/__tests__/tauri-integration.test.ts
import { invoke } from '@tauri-apps/api/tauri';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Tauri invoke for testing
vi.mock('@tauri-apps/api/tauri', () => ({
	invoke: vi.fn()
}));

describe('Tauri API Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create customer via Tauri command', async () => {
		const mockCustomer = {
			id: 1,
			name: 'Test Customer',
			gstin: '27AAPFU0939F1ZV'
		};

		(invoke as any).mockResolvedValue(mockCustomer);

		const result = await invoke('create_customer', {
			customerData: {
				name: 'Test Customer',
				gstin: '27AAPFU0939F1ZV',
				address: 'Test Address'
			}
		});

		expect(invoke).toHaveBeenCalledWith('create_customer', {
			customerData: expect.objectContaining({
				name: 'Test Customer',
				gstin: '27AAPFU0939F1ZV'
			})
		});
		expect(result).toEqual(mockCustomer);
	});

	it('should handle GST calculation via Tauri', async () => {
		const mockCalculation = {
			cgst: 90,
			sgst: 90,
			igst: 0,
			total: 180
		};

		(invoke as any).mockResolvedValue(mockCalculation);

		const result = await invoke('calculate_gst', {
			amount: 1000,
			gstRate: 18,
			transactionType: 'INTRA_STATE'
		});

		expect(result).toEqual(mockCalculation);
	});
});
```

### **PDF Generation Testing**

**PDF Creation Integration:**

```typescript
// src/lib/__tests__/pdf-generation.test.ts
import { generateInvoicePDF } from '../pdf/generator';
import { jsPDF } from 'jspdf';

vi.mock('jspdf');

describe('PDF Generation', () => {
	it('should generate GST-compliant PDF', async () => {
		const mockPDF = {
			save: vi.fn(),
			addPage: vi.fn(),
			setFontSize: vi.fn(),
			text: vi.fn(),
			autoTable: vi.fn()
		};

		(jsPDF as any).mockImplementation(() => mockPDF);

		const invoiceData = {
			invoiceNumber: 'INV-001',
			customer: {
				name: 'Test Customer',
				gstin: '27AAPFU0939F1ZV'
			},
			items: [
				{
					description: 'Test Product',
					quantity: 1,
					rate: 1000,
					gstAmount: 180
				}
			]
		};

		await generateInvoicePDF(invoiceData);

		expect(mockPDF.text).toHaveBeenCalledWith(
			expect.stringContaining('TAX INVOICE'),
			expect.any(Number),
			expect.any(Number)
		);
	});
});
```

## 📊 GST Compliance Testing

### **Compliance Validation Suite**

**CBIC Guidelines Compliance:**

```typescript
// src/lib/__tests__/gst-compliance.test.ts
import { validateInvoiceCompliance } from '../compliance/validator';

describe('GST Compliance Testing', () => {
	describe('Invoice Format Compliance', () => {
		it('should validate mandatory fields presence', () => {
			const invoice = {
				invoiceNumber: 'INV-001',
				invoiceDate: '2025-06-28',
				supplierGSTIN: '27AAPFU0939F1ZV',
				recipientGSTIN: '29AAPFU0939F1ZX',
				placeOfSupply: 'Maharashtra',
				items: [
					{
						description: 'Test Product',
						hsnCode: '1234',
						quantity: 1,
						rate: 1000,
						taxableValue: 1000,
						gstRate: 18,
						cgst: 90,
						sgst: 90,
						igst: 0
					}
				],
				totalTaxableValue: 1000,
				totalTaxAmount: 180,
				totalInvoiceValue: 1180
			};

			const result = validateInvoiceCompliance(invoice);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should detect missing mandatory fields', () => {
			const incompleteInvoice = {
				invoiceNumber: 'INV-001'
				// Missing required fields
			};

			const result = validateInvoiceCompliance(incompleteInvoice);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Missing supplier GSTIN');
			expect(result.errors).toContain('Missing invoice date');
		});
	});

	describe('Tax Calculation Validation', () => {
		it('should validate intra-state tax breakdown', () => {
			const intraStateInvoice = {
				supplierState: 'Maharashtra',
				recipientState: 'Maharashtra',
				taxableAmount: 1000,
				gstRate: 18,
				cgst: 90,
				sgst: 90,
				igst: 0
			};

			const isValid = validateTaxCalculation(intraStateInvoice);
			expect(isValid).toBe(true);
		});

		it('should validate inter-state tax application', () => {
			const interStateInvoice = {
				supplierState: 'Maharashtra',
				recipientState: 'Karnataka',
				taxableAmount: 1000,
				gstRate: 18,
				cgst: 0,
				sgst: 0,
				igst: 180
			};

			const isValid = validateTaxCalculation(interStateInvoice);
			expect(isValid).toBe(true);
		});
	});

	describe('HSN Code Validation', () => {
		it('should validate HSN code format', () => {
			const validHSNCodes = ['1234', '123456', '12345678'];
			const invalidHSNCodes = ['12', '123', '123456789'];

			validHSNCodes.forEach((code) => {
				expect(validateHSNCode(code)).toBe(true);
			});

			invalidHSNCodes.forEach((code) => {
				expect(validateHSNCode(code)).toBe(false);
			});
		});
	});
});
```

## 🎭 End-to-End Testing

### **Critical User Workflows**

**Invoice Generation Workflow:**

```typescript
// tests/e2e/invoice-generation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Invoice Generation E2E', () => {
	test('should create complete invoice from customer to PDF', async ({ page }) => {
		// Navigate to application
		await page.goto('/');

		// Create customer
		await page.click('[data-testid="customers-tab"]');
		await page.click('[data-testid="add-customer-btn"]');
		await page.fill('[data-testid="customer-name"]', 'Test Customer');
		await page.fill('[data-testid="customer-gstin"]', '27AAPFU0939F1ZV');
		await page.fill('[data-testid="customer-address"]', 'Test Address, Mumbai');
		await page.click('[data-testid="save-customer-btn"]');

		// Verify customer creation
		await expect(page.locator('[data-testid="customer-list"]')).toContainText('Test Customer');

		// Create product
		await page.click('[data-testid="products-tab"]');
		await page.click('[data-testid="add-product-btn"]');
		await page.fill('[data-testid="product-name"]', 'Test Product');
		await page.fill('[data-testid="product-hsn"]', '1234');
		await page.selectOption('[data-testid="product-gst-rate"]', '18');
		await page.fill('[data-testid="product-price"]', '1000');
		await page.click('[data-testid="save-product-btn"]');

		// Generate invoice
		await page.click('[data-testid="invoices-tab"]');
		await page.click('[data-testid="create-invoice-btn"]');
		await page.selectOption('[data-testid="invoice-customer"]', 'Test Customer');
		await page.click('[data-testid="add-item-btn"]');
		await page.selectOption('[data-testid="item-product"]', 'Test Product');
		await page.fill('[data-testid="item-quantity"]', '2');

		// Verify GST calculation
		await expect(page.locator('[data-testid="item-total"]')).toHaveText('2360.00');
		await expect(page.locator('[data-testid="cgst-amount"]')).toHaveText('180.00');
		await expect(page.locator('[data-testid="sgst-amount"]')).toHaveText('180.00');

		// Generate PDF
		const downloadPromise = page.waitForEvent('download');
		await page.click('[data-testid="generate-pdf-btn"]');
		const download = await downloadPromise;

		expect(download.suggestedFilename()).toMatch(/^INV-\d+\.pdf$/);
	});

	test('should handle inter-state transaction correctly', async ({ page }) => {
		await page.goto('/');

		// Set up inter-state transaction
		await page.selectOption('[data-testid="company-state"]', 'Maharashtra');
		await page.selectOption('[data-testid="customer-state"]', 'Karnataka');

		// Add item and verify IGST calculation
		await page.fill('[data-testid="item-amount"]', '1000');
		await page.selectOption('[data-testid="item-gst-rate"]', '18');

		await expect(page.locator('[data-testid="cgst-amount"]')).toHaveText('0.00');
		await expect(page.locator('[data-testid="sgst-amount"]')).toHaveText('0.00');
		await expect(page.locator('[data-testid="igst-amount"]')).toHaveText('180.00');
	});
});
```

## ⚡ Performance Testing

### **Performance Benchmarks**

**Application Startup Testing:**

```typescript
// tests/performance/startup.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
	test('should start application within 1 second', async ({ page }) => {
		const startTime = Date.now();

		await page.goto('/');
		await page.waitForSelector('[data-testid="main-dashboard"]');

		const loadTime = Date.now() - startTime;
		expect(loadTime).toBeLessThan(1000);
	});

	test('should generate PDF within 2 seconds', async ({ page }) => {
		await page.goto('/');

		// Set up invoice data
		await setupTestInvoice(page);

		const startTime = Date.now();
		await page.click('[data-testid="generate-pdf-btn"]');
		await page.waitForEvent('download');
		const pdfTime = Date.now() - startTime;

		expect(pdfTime).toBeLessThan(2000);
	});

	test('should handle large invoice with 100 items', async ({ page }) => {
		await page.goto('/');

		// Create invoice with 100 items
		for (let i = 0; i < 100; i++) {
			await page.click('[data-testid="add-item-btn"]');
			await page.fill(`[data-testid="item-${i}-quantity"]`, '1');
			await page.fill(`[data-testid="item-${i}-rate"]`, '100');
		}

		const startTime = Date.now();
		await page.click('[data-testid="calculate-total-btn"]');
		await page.waitForSelector('[data-testid="total-calculated"]');
		const calcTime = Date.now() - startTime;

		expect(calcTime).toBeLessThan(500); // Should calculate within 500ms
	});
});
```

## 🔧 Test Automation

### **CI/CD Integration**

**GitHub Actions Test Workflow:**

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration

      - name: Generate coverage
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      - name: Run Rust tests
        run: cd src-tauri && cargo test

  test-e2e:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm playwright install

      - name: Build application
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report-${{ matrix.os }}
          path: playwright-report/
```

### **Test Commands Reference**

```json
{
	"scripts": {
		"test": "vitest",
		"test:unit": "vitest run src/**/*.test.ts",
		"test:integration": "vitest run src/**/*.integration.test.ts",
		"test:e2e": "playwright test",
		"test:coverage": "vitest run --coverage",
		"test:ui": "vitest --ui",
		"test:watch": "vitest --watch",
		"test:gst": "vitest run src/lib/gst/**/*.test.ts",
		"test:compliance": "vitest run src/lib/compliance/**/*.test.ts"
	}
}
```

## 📈 Quality Assurance Procedures

### **Pre-Release Checklist**

**GST Compliance Verification:**

- [ ] All tax calculations verified against CBIC guidelines
- [ ] Invoice format compliance validated
- [ ] GSTIN validation working correctly
- [ ] HSN/SAC code validation functional
- [ ] Sequential invoice numbering verified

**Cross-Platform Testing:**

- [ ] Application builds on Windows, macOS, Linux
- [ ] PDF generation works on all platforms
- [ ] Database operations consistent across platforms
- [ ] File system operations functional

**Performance Validation:**

- [ ] App size under 5MB
- [ ] Memory usage under 100MB idle
- [ ] Startup time under 1 second
- [ ] PDF generation under 2 seconds

**Security Testing:**

- [ ] Database queries protected against injection
- [ ] File operations sandboxed properly
- [ ] PDF generation secure
- [ ] Data validation comprehensive

### **Bug Reporting Template**

```markdown
## Bug Report

**Environment:**

- OS: [Windows/macOS/Linux]
- App Version: [Version]
- Node Version: [Version]
- Rust Version: [Version]

**Steps to Reproduce:**

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[Description of expected behavior]

**Actual Behavior:**
[Description of actual behavior]

**GST Compliance Impact:**

- [ ] Affects tax calculations
- [ ] Affects invoice format
- [ ] Affects compliance requirements
- [ ] No compliance impact

**Logs:**
```

[Paste relevant logs here]

```

**Screenshots:**
[If applicable]
```

---

## 🎯 Success Metrics

**Test Coverage Targets:**

- **Unit Tests**: 85% minimum coverage
- **Integration Tests**: 70% critical path coverage
- **E2E Tests**: 100% user workflow coverage
- **GST Compliance**: 100% compliance scenario coverage

**Performance Targets:**

- **Build Time**: < 3 minutes
- **Test Execution**: < 5 minutes full suite
- **E2E Tests**: < 10 minutes across all platforms

**Quality Gates:**

- **Zero Critical Bugs**: Before release
- **All Compliance Tests Passing**: Required for release
- **Performance Tests Passing**: Required for release
- **Cross-Platform Tests Passing**: Required for release

This comprehensive testing strategy ensures Payvlo delivers a reliable, GST-compliant invoice generator that meets all performance and quality requirements across all supported platforms.
