# API Documentation

## Overview

Payvlo uses Tauri's command system to communicate between the frontend (SvelteKit) and backend (Rust). This document covers all available Tauri commands, their parameters, return values, and usage examples.

## 🔧 Tauri Commands

### Customer Management

#### `get_customers`

Retrieve all customers from the database.

```rust
#[tauri::command]
pub async fn get_customers() -> Result<Vec<Customer>, String>
```

**Parameters:** None

**Returns:** Array of Customer objects

**Example Usage:**

```typescript
import { invoke } from '@tauri-apps/api/tauri';

const customers = await invoke<Customer[]>('get_customers');
```

#### `create_customer`

Create a new customer record.

```rust
#[tauri::command]
pub async fn create_customer(customer_data: CustomerData) -> Result<Customer, String>
```

**Parameters:**

- `customer_data`: CustomerData object

**Type Definitions:**

```typescript
interface CustomerData {
	name: string;
	gstin?: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	pincode?: string;
}

interface Customer extends CustomerData {
	id: number;
	created_at: string;
}
```

**Example Usage:**

```typescript
const newCustomer = await invoke<Customer>('create_customer', {
	customerData: {
		name: 'ABC Medical Supplies',
		gstin: '27AABCU9603R1ZX',
		email: 'contact@abcmedical.com',
		phone: '+91-9876543210',
		address: '123 Medical Street',
		city: 'Mumbai',
		state: 'Maharashtra',
		pincode: '400001'
	}
});
```

#### `update_customer`

Update an existing customer record.

```rust
#[tauri::command]
pub async fn update_customer(id: i64, customer_data: CustomerData) -> Result<Customer, String>
```

**Parameters:**

- `id`: Customer ID (number)
- `customer_data`: Updated CustomerData object

**Example Usage:**

```typescript
const updatedCustomer = await invoke<Customer>('update_customer', {
	id: 1,
	customerData: {
		name: 'ABC Medical Supplies Pvt Ltd',
		email: 'info@abcmedical.com'
	}
});
```

#### `delete_customer`

Delete a customer record.

```rust
#[tauri::command]
pub async fn delete_customer(id: i64) -> Result<bool, String>
```

**Parameters:**

- `id`: Customer ID (number)

**Returns:** Success boolean

**Example Usage:**

```typescript
const success = await invoke<boolean>('delete_customer', { id: 1 });
```

#### `validate_gstin`

Validate GSTIN format and check digit.

```rust
#[tauri::command]
pub async fn validate_gstin(gstin: String) -> Result<GstinValidation, String>
```

**Parameters:**

- `gstin`: GSTIN string to validate

**Type Definitions:**

```typescript
interface GstinValidation {
	is_valid: boolean;
	state_code: string;
	pan: string;
	entity_number: string;
	check_digit: string;
	errors: string[];
}
```

**Example Usage:**

```typescript
const validation = await invoke<GstinValidation>('validate_gstin', {
	gstin: '27AABCU9603R1ZX'
});

if (validation.is_valid) {
	console.log('Valid GSTIN for state:', validation.state_code);
} else {
	console.error('Invalid GSTIN:', validation.errors);
}
```

### Product Management

#### `get_products`

Retrieve all products from the database.

```rust
#[tauri::command]
pub async fn get_products() -> Result<Vec<Product>, String>
```

**Type Definitions:**

```typescript
interface Product {
	id: number;
	name: string;
	hsn_sac_code: string;
	description?: string;
	unit: string;
	rate: number;
	gst_rate: number;
	created_at: string;
}
```

#### `create_product`

Create a new product record.

```rust
#[tauri::command]
pub async fn create_product(product_data: ProductData) -> Result<Product, String>
```

**Type Definitions:**

```typescript
interface ProductData {
	name: string;
	hsn_sac_code: string;
	description?: string;
	unit: string;
	rate: number;
	gst_rate: number;
}
```

**Example Usage:**

```typescript
const newProduct = await invoke<Product>('create_product', {
	productData: {
		name: 'Digital Thermometer',
		hsn_sac_code: '90181900',
		description: 'Non-contact infrared thermometer',
		unit: 'Piece',
		rate: 2500.0,
		gst_rate: 12.0
	}
});
```

#### `search_hsn_codes`

Search for HSN/SAC codes by description or code.

```rust
#[tauri::command]
pub async fn search_hsn_codes(query: String) -> Result<Vec<HsnCode>, String>
```

**Type Definitions:**

```typescript
interface HsnCode {
	code: string;
	description: string;
	gst_rate: number;
	category: string;
}
```

**Example Usage:**

```typescript
const hsnCodes = await invoke<HsnCode[]>('search_hsn_codes', {
	query: 'medical equipment'
});
```

### Invoice Management

#### `get_invoices`

Retrieve invoices with optional filters.

```rust
#[tauri::command]
pub async fn get_invoices(
    limit: Option<i64>,
    offset: Option<i64>,
    status: Option<String>,
    date_from: Option<String>,
    date_to: Option<String>
) -> Result<InvoiceList, String>
```

**Type Definitions:**

```typescript
interface InvoiceList {
	invoices: Invoice[];
	total_count: number;
	has_more: boolean;
}

interface Invoice {
	id: number;
	invoice_number: string;
	customer_id: number;
	customer_name: string;
	invoice_date: string;
	place_of_supply: string;
	subtotal: number;
	cgst_amount: number;
	sgst_amount: number;
	igst_amount: number;
	total_amount: number;
	status: string;
	created_at: string;
	items: InvoiceItem[];
}

interface InvoiceItem {
	id: number;
	product_id: number;
	product_name: string;
	hsn_sac_code: string;
	quantity: number;
	rate: number;
	amount: number;
	gst_rate: number;
	cgst_amount: number;
	sgst_amount: number;
	igst_amount: number;
}
```

**Example Usage:**

```typescript
// Get recent invoices
const recentInvoices = await invoke<InvoiceList>('get_invoices', {
	limit: 20,
	offset: 0,
	status: null,
	dateFrom: null,
	dateTo: null
});

// Get paid invoices for current month
const paidInvoices = await invoke<InvoiceList>('get_invoices', {
	limit: 100,
	offset: 0,
	status: 'paid',
	dateFrom: '2024-01-01',
	dateTo: '2024-01-31'
});
```

#### `create_invoice`

Create a new invoice with GST calculations.

```rust
#[tauri::command]
pub async fn create_invoice(invoice_data: InvoiceData) -> Result<Invoice, String>
```

**Type Definitions:**

```typescript
interface InvoiceData {
	customer_id: number;
	invoice_date: string;
	place_of_supply: string;
	items: InvoiceItemData[];
	notes?: string;
}

interface InvoiceItemData {
	product_id: number;
	quantity: number;
	rate: number;
	discount?: number;
}
```

**Example Usage:**

```typescript
const newInvoice = await invoke<Invoice>('create_invoice', {
	invoiceData: {
		customer_id: 1,
		invoice_date: '2024-01-15',
		place_of_supply: 'Maharashtra',
		items: [
			{
				product_id: 1,
				quantity: 2,
				rate: 2500.0
			},
			{
				product_id: 2,
				quantity: 1,
				rate: 5000.0,
				discount: 500.0
			}
		],
		notes: 'Thank you for your business!'
	}
});
```

#### `update_invoice_status`

Update invoice status (draft, sent, paid, cancelled).

```rust
#[tauri::command]
pub async fn update_invoice_status(id: i64, status: String) -> Result<Invoice, String>
```

**Example Usage:**

```typescript
const updatedInvoice = await invoke<Invoice>('update_invoice_status', {
	id: 1,
	status: 'paid'
});
```

### GST Calculations

#### `calculate_gst`

Calculate GST amounts for given parameters.

```rust
#[tauri::command]
pub async fn calculate_gst(
    amount: f64,
    gst_rate: f64,
    business_state: String,
    place_of_supply: String
) -> Result<GstCalculation, String>
```

**Type Definitions:**

```typescript
interface GstCalculation {
	taxable_amount: number;
	cgst: number;
	sgst: number;
	igst: number;
	total_tax: number;
	total_amount: number;
	is_inter_state: boolean;
}
```

**Example Usage:**

```typescript
const gstCalc = await invoke<GstCalculation>('calculate_gst', {
	amount: 10000.0,
	gstRate: 18.0,
	businessState: 'Maharashtra',
	placeOfSupply: 'Karnataka'
});

console.log('IGST Amount:', gstCalc.igst); // Inter-state transaction
```

#### `get_gst_rates`

Get available GST rates and their descriptions.

```rust
#[tauri::command]
pub async fn get_gst_rates() -> Result<Vec<GstRate>, String>
```

**Type Definitions:**

```typescript
interface GstRate {
	rate: number;
	description: string;
	applicable_items: string[];
}
```

### PDF Generation

#### `generate_invoice_pdf`

Generate PDF for an invoice.

```rust
#[tauri::command]
pub async fn generate_invoice_pdf(
    invoice_id: i64,
    template: Option<String>
) -> Result<PdfResult, String>
```

**Type Definitions:**

```typescript
interface PdfResult {
	file_path: string;
	file_size: number;
	success: boolean;
}
```

**Example Usage:**

```typescript
const pdfResult = await invoke<PdfResult>('generate_invoice_pdf', {
	invoiceId: 1,
	template: 'standard'
});

if (pdfResult.success) {
	console.log('PDF generated at:', pdfResult.file_path);
}
```

#### `save_pdf_to_path`

Save PDF to user-selected location.

```rust
#[tauri::command]
pub async fn save_pdf_to_path(
    invoice_id: i64,
    file_path: String
) -> Result<bool, String>
```

### File Operations

#### `export_data`

Export database to JSON or CSV format.

```rust
#[tauri::command]
pub async fn export_data(
    format: String,
    tables: Vec<String>,
    file_path: String
) -> Result<ExportResult, String>
```

**Type Definitions:**

```typescript
interface ExportResult {
	success: boolean;
	file_path: string;
	records_exported: number;
	file_size: number;
}
```

**Example Usage:**

```typescript
const exportResult = await invoke<ExportResult>('export_data', {
	format: 'json',
	tables: ['customers', 'products', 'invoices'],
	filePath: '/Users/username/Documents/payvlo-backup.json'
});
```

#### `import_data`

Import data from JSON or CSV file.

```rust
#[tauri::command]
pub async fn import_data(
    file_path: String,
    table: String,
    merge_strategy: String
) -> Result<ImportResult, String>
```

**Type Definitions:**

```typescript
interface ImportResult {
	success: boolean;
	records_imported: number;
	records_skipped: number;
	errors: string[];
}
```

### Settings & Configuration

#### `get_settings`

Get application settings.

```rust
#[tauri::command]
pub async fn get_settings() -> Result<AppSettings, String>
```

**Type Definitions:**

```typescript
interface AppSettings {
	business_name: string;
	business_gstin: string;
	business_address: string;
	business_state: string;
	business_email: string;
	business_phone: string;
	invoice_prefix: string;
	invoice_counter: number;
	default_gst_rate: number;
	currency: string;
	date_format: string;
	pdf_template: string;
}
```

#### `update_settings`

Update application settings.

```rust
#[tauri::command]
pub async fn update_settings(settings: AppSettings) -> Result<AppSettings, String>
```

### Database Operations

#### `backup_database`

Create database backup.

```rust
#[tauri::command]
pub async fn backup_database(file_path: String) -> Result<BackupResult, String>
```

**Type Definitions:**

```typescript
interface BackupResult {
	success: boolean;
	backup_path: string;
	backup_size: number;
	timestamp: string;
}
```

#### `restore_database`

Restore database from backup.

```rust
#[tauri::command]
pub async fn restore_database(file_path: String) -> Result<RestoreResult, String>
```

**Type Definitions:**

```typescript
interface RestoreResult {
	success: boolean;
	records_restored: number;
	tables_restored: string[];
	errors: string[];
}
```

## 🎯 Error Handling

All Tauri commands return `Result<T, String>` where the error string contains a descriptive error message. Frontend should handle these appropriately:

```typescript
try {
	const result = await invoke<Customer>('create_customer', { customerData });
	// Handle success
} catch (error) {
	console.error('Failed to create customer:', error);
	// Show user-friendly error message
	showNotification('Error creating customer: ' + error, 'error');
}
```

## 🔒 Security Considerations

- All database operations are performed on the backend (Rust)
- Input validation is performed both frontend and backend
- GSTIN validation includes checksum verification
- File operations require user permission through Tauri's file system API
- No direct SQL queries from frontend - all through typed commands

## 📝 Usage Patterns

### Complete Invoice Creation Flow

```typescript
// 1. Get or create customer
const customer = await invoke<Customer>('create_customer', { customerData });

// 2. Create invoice
const invoice = await invoke<Invoice>('create_invoice', {
	invoiceData: {
		customer_id: customer.id,
		invoice_date: new Date().toISOString().split('T')[0],
		place_of_supply: customer.state,
		items: selectedItems
	}
});

// 3. Generate PDF
const pdfResult = await invoke<PdfResult>('generate_invoice_pdf', {
	invoiceId: invoice.id,
	template: 'standard'
});

// 4. Update status
await invoke<Invoice>('update_invoice_status', {
	id: invoice.id,
	status: 'sent'
});
```

### GST Calculation in Real-time

```typescript
// Calculate GST as user types
const handleAmountChange = async (amount: number, gstRate: number) => {
	try {
		const calculation = await invoke<GstCalculation>('calculate_gst', {
			amount,
			gstRate,
			businessState: settings.business_state,
			placeOfSupply: selectedCustomer.state
		});

		updateInvoiceCalculations(calculation);
	} catch (error) {
		console.error('GST calculation error:', error);
	}
};
```

## 🧪 Testing

Commands can be tested using Tauri's test utilities:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tauri::test::{mock_app, MockBuilder};

    #[tokio::test]
    async fn test_create_customer() {
        let app = mock_app();
        let customer_data = CustomerData {
            name: "Test Customer".to_string(),
            gstin: Some("27AABCU9603R1ZX".to_string()),
            // ... other fields
        };

        let result = create_customer(customer_data).await;
        assert!(result.is_ok());
    }
}
```

## 📚 Additional Resources

- [Tauri Command Documentation](https://tauri.app/v1/guides/features/command)
- [Rust SQLite Integration](https://docs.rs/rusqlite/latest/rusqlite/)
- [GST Compliance Requirements](./gst-compliance.md)
