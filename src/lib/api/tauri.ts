// =====================================================
// Payvlo GST Invoice Generator - Tauri API Layer
// TypeScript interfaces for Rust backend commands
// =====================================================

import { invoke } from '@tauri-apps/api/core';
import type {
	CompanySettings,
	Customer,
	Product,
	IndianState,
	CreateCompanySettings,
	CreateCustomer,
	CreateProduct
} from '../types/database';

// =====================================================
// Error Handling
// =====================================================

export interface TauriApiError {
	error: string;
	message: string;
}

export class TauriError extends Error {
	public readonly error: string;

	constructor(errorData: TauriApiError) {
		super(errorData.message);
		this.error = errorData.error;
		this.name = 'TauriError';
	}
}

// Helper function to handle Tauri command errors
async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
	try {
		return await invoke<T>(command, args);
	} catch (error) {
		if (typeof error === 'object' && error !== null && 'error' in error) {
			throw new TauriError(error as TauriApiError);
		}
		throw new Error(`Failed to execute command: ${command}`);
	}
}

// =====================================================
// Database Initialization API
// =====================================================

export const databaseApi = {
	/**
	 * Initialize the SQLite database and create tables
	 */
	async initialize(): Promise<boolean> {
		return tauriInvoke<boolean>('initialize_database');
	},

	/**
	 * Check if database is healthy and accessible
	 */
	async checkHealth(): Promise<boolean> {
		return tauriInvoke<boolean>('check_database_health');
	}
};

// =====================================================
// Company Settings API
// =====================================================

export const companyApi = {
	/**
	 * Get current company settings
	 */
	async getSettings(): Promise<CompanySettings | null> {
		return tauriInvoke<CompanySettings | null>('get_company_settings');
	},

	/**
	 * Save company settings (create or update)
	 */
	async saveSettings(settings: CreateCompanySettings | CompanySettings): Promise<number> {
		return tauriInvoke<number>('save_company_settings', { settings });
	}
};

// =====================================================
// Customer Management API
// =====================================================

export interface CustomerListOptions {
	limit?: number;
	offset?: number;
}

export const customerApi = {
	/**
	 * Get list of customers with pagination
	 */
	async getCustomers(options?: CustomerListOptions): Promise<Customer[]> {
		return tauriInvoke<Customer[]>('get_customers', {
			limit: options?.limit,
			offset: options?.offset
		});
	},

	/**
	 * Get customer by ID
	 */
	async getById(id: number): Promise<Customer | null> {
		return tauriInvoke<Customer | null>('get_customer_by_id', { id });
	},

	/**
	 * Save customer (create or update)
	 */
	async save(customer: CreateCustomer | Customer): Promise<number> {
		return tauriInvoke<number>('save_customer', { customer });
	},

	/**
	 * Delete customer by ID
	 */
	async delete(id: number): Promise<boolean> {
		return tauriInvoke<boolean>('delete_customer', { id });
	},

	/**
	 * Search customers by name, GSTIN, phone, or email
	 */
	async search(query: string): Promise<Customer[]> {
		return tauriInvoke<Customer[]>('search_customers', { query });
	}
};

// =====================================================
// Product Management API
// =====================================================

export interface ProductListOptions {
	limit?: number;
	offset?: number;
}

export const productApi = {
	/**
	 * Get list of active products with pagination
	 */
	async getProducts(options?: ProductListOptions): Promise<Product[]> {
		return tauriInvoke<Product[]>('get_products', {
			limit: options?.limit,
			offset: options?.offset
		});
	},

	/**
	 * Get product by ID
	 */
	async getById(id: number): Promise<Product | null> {
		return tauriInvoke<Product | null>('get_product_by_id', { id });
	},

	/**
	 * Save product (create or update)
	 */
	async save(product: CreateProduct | Product): Promise<number> {
		return tauriInvoke<number>('save_product', { product });
	},

	/**
	 * Soft delete product (set inactive)
	 */
	async delete(id: number): Promise<boolean> {
		return tauriInvoke<boolean>('delete_product', { id });
	},

	/**
	 * Search products by name, code, or HSN/SAC
	 */
	async search(query: string): Promise<Product[]> {
		return tauriInvoke<Product[]>('search_products', { query });
	}
};

// =====================================================
// Indian States API
// =====================================================

export const statesApi = {
	/**
	 * Get all Indian states and union territories
	 */
	async getAll(): Promise<IndianState[]> {
		return tauriInvoke<IndianState[]>('get_indian_states');
	},

	/**
	 * Get state by 2-digit state code
	 */
	async getByCode(stateCode: string): Promise<IndianState | null> {
		return tauriInvoke<IndianState | null>('get_state_by_code', { state_code: stateCode });
	}
};

// =====================================================
// Utility API
// =====================================================

export interface RecordCounts {
	customers: number;
	products: number;
	invoices: number;
}

export const utilityApi = {
	/**
	 * Get record counts for dashboard
	 */
	async getRecordCounts(): Promise<RecordCounts> {
		return tauriInvoke<RecordCounts>('get_record_counts');
	},

	/**
	 * Generate next invoice number based on format
	 */
	async getNextInvoiceNumber(format?: string): Promise<string> {
		return tauriInvoke<string>('get_next_invoice_number', { format });
	}
};

// =====================================================
// GST Validation API
// =====================================================

export interface GstinValidationResult {
	is_valid: boolean;
	state_code?: string;
	pan_number?: string;
	entity_number?: string;
	check_digit?: string;
	error?: string;
}

export interface HsnSacValidationResult {
	is_valid: boolean;
	validation_type?: 'HSN' | 'SAC';
	description?: string;
	suggested_gst_rate?: number;
	error?: string;
}

export const validationApi = {
	/**
	 * Validate GSTIN format and checksum
	 */
	async validateGstin(gstin: string): Promise<GstinValidationResult> {
		return tauriInvoke<GstinValidationResult>('validate_gstin', { gstin });
	},

	/**
	 * Validate HSN/SAC code format
	 */
	async validateHsnSac(code: string): Promise<HsnSacValidationResult> {
		return tauriInvoke<HsnSacValidationResult>('validate_hsn_sac', { code });
	}
};

// =====================================================
// Combined API Object
// =====================================================

export const api = {
	database: databaseApi,
	company: companyApi,
	customers: customerApi,
	products: productApi,
	states: statesApi,
	utility: utilityApi,
	validation: validationApi
};

export default api;

// =====================================================
// Convenience Functions
// =====================================================

/**
 * Initialize the application database
 * Call this when the app starts
 */
export async function initializeApp(): Promise<boolean> {
	try {
		await api.database.initialize();
		const isHealthy = await api.database.checkHealth();
		if (!isHealthy) {
			throw new Error('Database health check failed');
		}
		return true;
	} catch (error) {
		console.error('Failed to initialize app:', error);
		return false;
	}
}

/**
 * Get dashboard data in a single call
 */
export async function getDashboardData(): Promise<{
	counts: RecordCounts;
	companySettings: CompanySettings | null;
}> {
	const [counts, companySettings] = await Promise.all([
		api.utility.getRecordCounts(),
		api.company.getSettings()
	]);

	return { counts, companySettings };
}

/**
 * Search across customers and products
 */
export async function globalSearch(query: string): Promise<{
	customers: Customer[];
	products: Product[];
}> {
	const [customers, products] = await Promise.all([
		api.customers.search(query),
		api.products.search(query)
	]);

	return { customers, products };
} 