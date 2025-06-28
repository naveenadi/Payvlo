// =====================================================
// Payvlo GST Invoice Generator - Database Types
// TypeScript Types matching SQLite Schema
// =====================================================

// Base timestamps interface
interface BaseEntity {
	id: number;
	created_at: string;
	updated_at?: string;
}

// Company/Business Settings
export interface CompanySettings extends BaseEntity {
	company_name: string;
	gstin: string; // 15-character GSTIN
	pan: string; // 10-character PAN
	address_line1: string;
	address_line2?: string;
	city: string;
	state: string;
	pincode: string;
	phone?: string;
	email?: string;
	website?: string;
	bank_name?: string;
	account_number?: string;
	ifsc_code?: string;
	logo_path?: string;
}

// Customer Management
export type CustomerType = 'B2B' | 'B2C' | 'EXPORT';

export interface Customer extends BaseEntity {
	customer_name: string;
	gstin?: string; // Optional for B2C customers
	pan?: string;
	customer_type: CustomerType;
	address_line1: string;
	address_line2?: string;
	city: string;
	state: string;
	pincode: string;
	phone?: string;
	email?: string;
	credit_limit: number;
	credit_period_days: number;
	is_active: boolean;
}

// Product/Service Catalog
export type ProductType = 'GOODS' | 'SERVICES';

export interface Product extends BaseEntity {
	product_code: string;
	product_name: string;
	description?: string;
	hsn_sac_code: string;
	product_type: ProductType;
	unit_of_measurement: string;
	rate: number;
	gst_rate: number; // 0, 5, 12, 18, 28
	cess_rate: number;
	is_active: boolean;
}

// Invoice Management
export type InvoiceType = 'REGULAR' | 'EXPORT' | 'DEBIT_NOTE' | 'CREDIT_NOTE';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice extends BaseEntity {
	invoice_number: string;
	invoice_date: string; // ISO date string
	customer_id: number;
	invoice_type: InvoiceType;
	place_of_supply: string;
	reverse_charge: boolean;

	// Amounts before tax
	subtotal: number;
	total_discount: number;
	taxable_amount: number;

	// Tax amounts
	cgst_amount: number;
	sgst_amount: number;
	igst_amount: number;
	cess_amount: number;
	total_tax: number;

	// Final amounts
	total_amount: number;
	round_off: number;
	final_amount: number;

	// Payment and status
	payment_terms?: string;
	due_date?: string; // ISO date string
	status: InvoiceStatus;

	// Additional fields
	notes?: string;
	terms_conditions?: string;
	pdf_path?: string;

	// Relations (populated via joins)
	customer?: Customer;
	items?: InvoiceItem[];
}

// Invoice Line Items
export interface InvoiceItem {
	id: number;
	invoice_id: number;
	product_id: number;
	line_number: number;

	// Product details (snapshot at time of invoice)
	product_code: string;
	product_name: string;
	description?: string;
	hsn_sac_code: string;

	// Quantity and rates
	quantity: number;
	unit_price: number;
	discount_percent: number;
	discount_amount: number;
	taxable_amount: number;

	// Tax rates and amounts
	gst_rate: number;
	cgst_rate: number;
	sgst_rate: number;
	igst_rate: number;
	cess_rate: number;

	cgst_amount: number;
	sgst_amount: number;
	igst_amount: number;
	cess_amount: number;
	total_tax: number;

	// Line total
	line_total: number;

	created_at: string;

	// Relations
	product?: Product;
}

// GST Tax Rates Configuration
export interface GstRate {
	id: number;
	hsn_sac_code: string;
	description?: string;
	gst_rate: number;
	cess_rate: number;
	effective_from: string; // ISO date string
	effective_to?: string; // ISO date string
	is_active: boolean;
	created_at: string;
}

// Indian States Master
export interface IndianState {
	id: number;
	state_code: string; // 2-digit code for GSTIN
	state_name: string;
	is_union_territory: boolean;
	is_active: boolean;
}

// Payment Records
export type PaymentMethod = 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'OTHER';

export interface Payment {
	id: number;
	invoice_id: number;
	payment_date: string; // ISO date string
	amount: number;
	payment_method: PaymentMethod;
	reference_number?: string;
	notes?: string;
	created_at: string;

	// Relations
	invoice?: Invoice;
}

// =====================================================
// GST Calculation Types
// =====================================================

export interface GstCalculation {
	taxable_amount: number;
	gst_rate: number;
	cgst_rate: number;
	sgst_rate: number;
	igst_rate: number;
	cess_rate: number;
	cgst_amount: number;
	sgst_amount: number;
	igst_amount: number;
	cess_amount: number;
	total_tax: number;
	total_amount: number;
}

export interface LineItemCalculation {
	quantity: number;
	unit_price: number;
	discount_percent: number;
	discount_amount: number;
	taxable_amount: number;
	gst_calculation: GstCalculation;
	line_total: number;
}

export interface InvoiceTotals {
	subtotal: number;
	total_discount: number;
	taxable_amount: number;
	cgst_total: number;
	sgst_total: number;
	igst_total: number;
	cess_total: number;
	total_tax: number;
	total_amount: number;
	round_off: number;
	final_amount: number;
}

// =====================================================
// Form and Input Types
// =====================================================

// Create types (without id and timestamps)
export type CreateCompanySettings = Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>;
export type CreateCustomer = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type CreateProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type CreateInvoice = Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'customer' | 'items'>;
export type CreateInvoiceItem = Omit<InvoiceItem, 'id' | 'created_at' | 'product'>;
export type CreatePayment = Omit<Payment, 'id' | 'created_at' | 'invoice'>;

// Update types (optional fields except id)
export type UpdateCompanySettings = Partial<CreateCompanySettings> & { id: number };
export type UpdateCustomer = Partial<CreateCustomer> & { id: number };
export type UpdateProduct = Partial<CreateProduct> & { id: number };
export type UpdateInvoice = Partial<CreateInvoice> & { id: number };
export type UpdateInvoiceItem = Partial<CreateInvoiceItem> & { id: number };

// =====================================================
// Query and Filter Types
// =====================================================

export interface CustomerFilter {
	customer_type?: CustomerType;
	state?: string;
	is_active?: boolean;
	search?: string; // Search in name, gstin, phone, email
}

export interface ProductFilter {
	product_type?: ProductType;
	hsn_sac_code?: string;
	gst_rate?: number;
	is_active?: boolean;
	search?: string; // Search in name, code, description
}

export interface InvoiceFilter {
	customer_id?: number;
	invoice_type?: InvoiceType;
	status?: InvoiceStatus;
	date_from?: string;
	date_to?: string;
	search?: string; // Search in invoice number, customer name
}

export interface PaymentFilter {
	invoice_id?: number;
	payment_method?: PaymentMethod;
	date_from?: string;
	date_to?: string;
}

// =====================================================
// API Response Types
// =====================================================

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	total_pages: number;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

// =====================================================
// Validation Types
// =====================================================

export interface ValidationError {
	field: string;
	message: string;
}

export interface FormValidation {
	isValid: boolean;
	errors: ValidationError[];
}

// GST Validation
export interface GstinValidation {
	isValid: boolean;
	stateCode?: string;
	panNumber?: string;
	entityNumber?: string;
	checkDigit?: string;
	error?: string;
}

export interface HsnSacValidation {
	isValid: boolean;
	type?: 'HSN' | 'SAC';
	description?: string;
	suggestedGstRate?: number;
	error?: string;
}

// =====================================================
// Report Types
// =====================================================

export interface SalesReport {
	period: {
		from: string;
		to: string;
	};
	totals: {
		gross_sales: number;
		total_discount: number;
		taxable_amount: number;
		cgst_collected: number;
		sgst_collected: number;
		igst_collected: number;
		total_tax_collected: number;
		net_sales: number;
	};
	by_gst_rate: Array<{
		gst_rate: number;
		taxable_amount: number;
		tax_amount: number;
		count: number;
	}>;
	by_customer_type: Array<{
		customer_type: CustomerType;
		amount: number;
		count: number;
	}>;
}

export interface GstReturn {
	period: string; // MMYYYY format
	gstin: string;
	b2b: Array<{
		customer_gstin: string;
		invoices: Array<{
			invoice_number: string;
			invoice_date: string;
			taxable_amount: number;
			igst_amount: number;
			cgst_amount: number;
			sgst_amount: number;
		}>;
	}>;
	b2c: Array<{
		state_code: string;
		taxable_amount: number;
		igst_amount: number;
		cgst_amount: number;
		sgst_amount: number;
	}>;
}

// =====================================================
// Dashboard Types
// =====================================================

export interface DashboardStats {
	total_customers: number;
	active_customers: number;
	total_products: number;
	active_products: number;
	total_invoices: number;
	draft_invoices: number;
	pending_payments: number;
	overdue_invoices: number;
	monthly_sales: number;
	monthly_tax_collected: number;
	pending_amount: number;
}

export interface ChartData {
	labels: string[];
	datasets: Array<{
		label: string;
		data: number[];
		backgroundColor?: string;
		borderColor?: string;
	}>;
}

// =====================================================
// Settings and Configuration
// =====================================================

export interface AppSettings {
	invoice_number_prefix: string;
	invoice_number_format: string; // e.g., "INV-{YYYY}-{MM}-{####}"
	default_payment_terms: string;
	default_gst_rate: number;
	auto_calculate_gst: boolean;
	round_off_invoices: boolean;
	send_invoice_emails: boolean;
	backup_frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
	currency: 'INR';
	date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
}

export interface EmailSettings {
	smtp_host: string;
	smtp_port: number;
	smtp_username: string;
	smtp_password: string;
	from_email: string;
	from_name: string;
	use_ssl: boolean;
}

// =====================================================
// All types are exported above where they are defined
// ===================================================== 