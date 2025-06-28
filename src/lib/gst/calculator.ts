// =====================================================
// Payvlo GST Calculator Engine
// Indian GST Compliance Calculation Functions
// =====================================================

import type {
	GstCalculation,
	LineItemCalculation,
	InvoiceTotals,
	CustomerType,
	GstinValidation,
	HsnSacValidation
} from '../types/database';

// =====================================================
// GST Rate Configuration
// =====================================================

export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GstRate = (typeof GST_RATES)[number];

// State codes for GSTIN validation and IGST determination
export const STATE_CODES = {
	'01': 'Jammu and Kashmir',
	'02': 'Himachal Pradesh',
	'03': 'Punjab',
	'04': 'Chandigarh',
	'05': 'Uttarakhand',
	'06': 'Haryana',
	'07': 'Delhi',
	'08': 'Rajasthan',
	'09': 'Uttar Pradesh',
	'10': 'Bihar',
	'11': 'Sikkim',
	'12': 'Arunachal Pradesh',
	'13': 'Nagaland',
	'14': 'Manipur',
	'15': 'Mizoram',
	'16': 'Tripura',
	'17': 'Meghalaya',
	'18': 'Assam',
	'19': 'West Bengal',
	'20': 'Jharkhand',
	'21': 'Odisha',
	'22': 'Chhattisgarh',
	'23': 'Madhya Pradesh',
	'24': 'Gujarat',
	'25': 'Daman and Diu',
	'26': 'Dadra and Nagar Haveli',
	'27': 'Maharashtra',
	'28': 'Andhra Pradesh',
	'29': 'Karnataka',
	'30': 'Goa',
	'31': 'Lakshadweep',
	'32': 'Kerala',
	'33': 'Tamil Nadu',
	'34': 'Puducherry',
	'35': 'Andaman and Nicobar Islands',
	'36': 'Telangana',
	'37': 'Andhra Pradesh (New)',
	'38': 'Ladakh'
} as const;

// =====================================================
// Core GST Calculation Functions
// =====================================================

/**
 * Determines if transaction is inter-state based on supplier and customer GSTINs
 * @param supplierGstin - Supplier's GSTIN (15 characters)
 * @param customerGstin - Customer's GSTIN (15 characters, optional for B2C)
 * @param customerType - B2B, B2C, or EXPORT
 * @returns boolean indicating if inter-state transaction
 */
export function isInterStateTransaction(
	supplierGstin: string,
	customerGstin: string | null,
	customerType: CustomerType
): boolean {
	// Export transactions are always inter-state (IGST)
	if (customerType === 'EXPORT') {
		return true;
	}

	// B2C transactions without customer GSTIN
	if (customerType === 'B2C' && !customerGstin) {
		return false; // Assume intra-state for B2C without GSTIN
	}

	// B2B or B2C with GSTIN - compare state codes
	if (customerGstin && supplierGstin.length >= 2 && customerGstin.length >= 2) {
		const supplierStateCode = supplierGstin.substring(0, 2);
		const customerStateCode = customerGstin.substring(0, 2);
		return supplierStateCode !== customerStateCode;
	}

	// Default to intra-state if cannot determine
	return false;
}

/**
 * Calculates GST amounts for a given taxable amount and rate
 * @param taxableAmount - Amount on which GST is calculated
 * @param gstRate - GST rate (0, 5, 12, 18, 28)
 * @param cessRate - Cess rate (optional, default 0)
 * @param isInterState - Whether transaction is inter-state
 * @returns GstCalculation object with all tax amounts
 */
export function calculateGst(
	taxableAmount: number,
	gstRate: number,
	cessRate: number = 0,
	isInterState: boolean = false
): GstCalculation {
	// Validate GST rate
	if (!GST_RATES.includes(gstRate as GstRate)) {
		throw new Error(`Invalid GST rate: ${gstRate}. Must be one of: ${GST_RATES.join(', ')}`);
	}

	// Calculate total GST amount
	const totalGstAmount = (taxableAmount * gstRate) / 100;
	const cessAmount = (taxableAmount * cessRate) / 100;

	let cgstAmount = 0;
	let sgstAmount = 0;
	let igstAmount = 0;

	if (isInterState) {
		// Inter-state transaction: Only IGST
		igstAmount = totalGstAmount;
	} else {
		// Intra-state transaction: CGST + SGST (equal split)
		cgstAmount = totalGstAmount / 2;
		sgstAmount = totalGstAmount / 2;
	}

	const totalTax = cgstAmount + sgstAmount + igstAmount + cessAmount;
	const totalAmount = taxableAmount + totalTax;

	return {
		taxable_amount: parseFloat(taxableAmount.toFixed(2)),
		gst_rate: gstRate,
		cgst_rate: isInterState ? 0 : gstRate / 2,
		sgst_rate: isInterState ? 0 : gstRate / 2,
		igst_rate: isInterState ? gstRate : 0,
		cess_rate: cessRate,
		cgst_amount: parseFloat(cgstAmount.toFixed(2)),
		sgst_amount: parseFloat(sgstAmount.toFixed(2)),
		igst_amount: parseFloat(igstAmount.toFixed(2)),
		cess_amount: parseFloat(cessAmount.toFixed(2)),
		total_tax: parseFloat(totalTax.toFixed(2)),
		total_amount: parseFloat(totalAmount.toFixed(2))
	};
}

/**
 * Calculates line item totals including discounts and GST
 * @param quantity - Quantity of items
 * @param unitPrice - Price per unit
 * @param discountPercent - Discount percentage (0-100)
 * @param gstRate - GST rate (0, 5, 12, 18, 28)
 * @param cessRate - Cess rate (optional)
 * @param isInterState - Whether transaction is inter-state
 * @returns LineItemCalculation with all amounts
 */
export function calculateLineItem(
	quantity: number,
	unitPrice: number,
	discountPercent: number = 0,
	gstRate: number,
	cessRate: number = 0,
	isInterState: boolean = false
): LineItemCalculation {
	// Validate inputs
	if (quantity <= 0) throw new Error('Quantity must be greater than 0');
	if (unitPrice < 0) throw new Error('Unit price cannot be negative');
	if (discountPercent < 0 || discountPercent > 100) {
		throw new Error('Discount percent must be between 0 and 100');
	}

	// Calculate base amounts
	const grossAmount = quantity * unitPrice;
	const discountAmount = (grossAmount * discountPercent) / 100;
	const taxableAmount = grossAmount - discountAmount;

	// Calculate GST
	const gstCalculation = calculateGst(taxableAmount, gstRate, cessRate, isInterState);

	// Calculate final line total
	const lineTotal = gstCalculation.total_amount;

	return {
		quantity: parseFloat(quantity.toFixed(3)),
		unit_price: parseFloat(unitPrice.toFixed(2)),
		discount_percent: parseFloat(discountPercent.toFixed(2)),
		discount_amount: parseFloat(discountAmount.toFixed(2)),
		taxable_amount: parseFloat(taxableAmount.toFixed(2)),
		gst_calculation: gstCalculation,
		line_total: parseFloat(lineTotal.toFixed(2))
	};
}

/**
 * Calculates invoice totals from array of line items
 * @param lineItems - Array of calculated line items
 * @param roundOff - Whether to apply rounding (default true)
 * @returns InvoiceTotals with all calculated amounts
 */
export function calculateInvoiceTotals(
	lineItems: LineItemCalculation[],
	roundOff: boolean = true
): InvoiceTotals {
	if (lineItems.length === 0) {
		throw new Error('Invoice must have at least one line item');
	}

	// Sum all line item amounts
	const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
	const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount_amount, 0);
	const taxableAmount = lineItems.reduce((sum, item) => sum + item.taxable_amount, 0);

	// Sum all tax amounts
	const cgstTotal = lineItems.reduce((sum, item) => sum + item.gst_calculation.cgst_amount, 0);
	const sgstTotal = lineItems.reduce((sum, item) => sum + item.gst_calculation.sgst_amount, 0);
	const igstTotal = lineItems.reduce((sum, item) => sum + item.gst_calculation.igst_amount, 0);
	const cessTotal = lineItems.reduce((sum, item) => sum + item.gst_calculation.cess_amount, 0);

	const totalTax = cgstTotal + sgstTotal + igstTotal + cessTotal;
	const totalAmount = taxableAmount + totalTax;

	// Calculate round off if enabled
	let roundOffAmount = 0;
	let finalAmount = totalAmount;

	if (roundOff) {
		finalAmount = Math.round(totalAmount);
		roundOffAmount = finalAmount - totalAmount;
	}

	return {
		subtotal: parseFloat(subtotal.toFixed(2)),
		total_discount: parseFloat(totalDiscount.toFixed(2)),
		taxable_amount: parseFloat(taxableAmount.toFixed(2)),
		cgst_total: parseFloat(cgstTotal.toFixed(2)),
		sgst_total: parseFloat(sgstTotal.toFixed(2)),
		igst_total: parseFloat(igstTotal.toFixed(2)),
		cess_total: parseFloat(cessTotal.toFixed(2)),
		total_tax: parseFloat(totalTax.toFixed(2)),
		total_amount: parseFloat(totalAmount.toFixed(2)),
		round_off: parseFloat(roundOffAmount.toFixed(2)),
		final_amount: parseFloat(finalAmount.toFixed(2))
	};
}

// =====================================================
// GSTIN Validation Functions
// =====================================================

/**
 * Validates GSTIN format and checksum
 * @param gstin - 15-character GSTIN
 * @returns GstinValidation object with validation results
 */
export function validateGstin(gstin: string): GstinValidation {
	if (!gstin || typeof gstin !== 'string') {
		return { isValid: false, error: 'GSTIN is required' };
	}

	// Remove spaces and convert to uppercase
	const cleanGstin = gstin.replace(/\s/g, '').toUpperCase();

	// Check length
	if (cleanGstin.length !== 15) {
		return { isValid: false, error: 'GSTIN must be exactly 15 characters' };
	}

	// Check format: 2 digits + 10 alphanumeric + 1 digit + 1 alpha + 1 alphanumeric
	const gstinPattern = /^[0-9]{2}[A-Z0-9]{10}[0-9][A-Z][A-Z0-9]$/;
	if (!gstinPattern.test(cleanGstin)) {
		return { isValid: false, error: 'Invalid GSTIN format' };
	}

	// Extract components
	const stateCode = cleanGstin.substring(0, 2);
	const panNumber = cleanGstin.substring(2, 12);
	const entityNumber = cleanGstin.substring(12, 13);
	const checkDigit = cleanGstin.substring(13, 15);

	// Validate state code
	if (!(stateCode in STATE_CODES)) {
		return { isValid: false, error: 'Invalid state code in GSTIN' };
	}

	// Validate PAN format within GSTIN
	const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
	if (!panPattern.test(panNumber)) {
		return { isValid: false, error: 'Invalid PAN format within GSTIN' };
	}

	// Calculate and validate checksum
	const isChecksumValid = validateGstinChecksum(cleanGstin);
	if (!isChecksumValid) {
		return { isValid: false, error: 'Invalid GSTIN checksum' };
	}

	return {
		isValid: true,
		stateCode,
		panNumber,
		entityNumber,
		checkDigit
	};
}

/**
 * Validates GSTIN checksum using the official algorithm
 * @param gstin - 15-character GSTIN
 * @returns boolean indicating if checksum is valid
 */
function validateGstinChecksum(gstin: string): boolean {
	const codePointChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const mod = 37;
	let factor = 2;
	let sum = 0;

	// Calculate checksum for first 14 characters
	for (let i = gstin.length - 2; i >= 0; i--) {
		let codePoint = codePointChars.indexOf(gstin[i]);
		if (codePoint === -1) return false; // Invalid character

		let digit = factor * codePoint;
		factor = factor === 2 ? 1 : 2;
		digit = Math.floor(digit / mod) + (digit % mod);
		sum += digit;
	}

	const calculatedCheckDigit = (mod - (sum % mod)) % mod;
	const providedCheckDigit = codePointChars.indexOf(gstin[14]);

	return calculatedCheckDigit === providedCheckDigit;
}

/**
 * Extracts state from GSTIN
 * @param gstin - 15-character GSTIN
 * @returns State name or null if invalid
 */
export function getStateFromGstin(gstin: string): string | null {
	const validation = validateGstin(gstin);
	if (!validation.isValid || !validation.stateCode) return null;

	return STATE_CODES[validation.stateCode as keyof typeof STATE_CODES] || null;
}

// =====================================================
// HSN/SAC Validation Functions
// =====================================================

/**
 * Validates HSN (Harmonized System of Nomenclature) or SAC (Services Accounting Code)
 * @param code - HSN or SAC code
 * @returns HsnSacValidation object with validation results
 */
export function validateHsnSac(code: string): HsnSacValidation {
	if (!code || typeof code !== 'string') {
		return { isValid: false, error: 'HSN/SAC code is required' };
	}

	const cleanCode = code.trim();

	// HSN codes: 2, 4, 6, or 8 digits for goods
	// SAC codes: 6 digits starting with 99 for services
	if (/^\d{2,8}$/.test(cleanCode)) {
		// HSN code for goods
		if (cleanCode.length < 2 || cleanCode.length > 8) {
			return { isValid: false, error: 'HSN code must be 2-8 digits' };
		}

		return {
			isValid: true,
			type: 'HSN',
			description: 'HSN code for goods'
		};
	} else if (/^99\d{4}$/.test(cleanCode)) {
		// SAC code for services
		return {
			isValid: true,
			type: 'SAC',
			description: 'SAC code for services'
		};
	} else {
		return {
			isValid: false,
			error: 'Invalid HSN/SAC format. HSN: 2-8 digits, SAC: 6 digits starting with 99'
		};
	}
}

// =====================================================
// Invoice Number Generation
// =====================================================

/**
 * Generates next invoice number based on format and last number
 * @param format - Invoice number format (e.g., "INV-{YYYY}-{MM}-{####}")
 * @param lastNumber - Last generated invoice number
 * @param date - Invoice date (optional, defaults to current date)
 * @returns Next invoice number
 */
export function generateInvoiceNumber(
	format: string = 'INV-{YYYY}-{MM}-{####}',
	lastNumber: string | null = null,
	date: Date = new Date()
): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	// Extract counter from last number if available
	let counter = 1;
	if (lastNumber) {
		const numberMatch = lastNumber.match(/(\d+)$/);
		if (numberMatch) {
			counter = parseInt(numberMatch[1]) + 1;
		}
	}

	// Replace format placeholders
	let invoiceNumber = format
		.replace('{YYYY}', String(year))
		.replace('{YY}', String(year).slice(-2))
		.replace('{MM}', month)
		.replace('{DD}', day);

	// Handle counter placeholders
	const counterMatch = invoiceNumber.match(/\{(#+)\}/);
	if (counterMatch) {
		const padding = counterMatch[1].length;
		const counterStr = String(counter).padStart(padding, '0');
		invoiceNumber = invoiceNumber.replace(/\{#+\}/, counterStr);
	}

	return invoiceNumber;
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Rounds amount to 2 decimal places
 * @param amount - Amount to round
 * @returns Rounded amount
 */
export function roundAmount(amount: number): number {
	return parseFloat(amount.toFixed(2));
}

/**
 * Converts number to Indian currency format
 * @param amount - Amount to format
 * @param includeCurrency - Whether to include ₹ symbol
 * @returns Formatted currency string
 */
export function formatIndianCurrency(amount: number, includeCurrency: boolean = true): string {
	const formattedAmount = new Intl.NumberFormat('en-IN', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(Math.abs(amount));

	const sign = amount < 0 ? '-' : '';
	const currency = includeCurrency ? '₹' : '';

	return `${sign}${currency}${formattedAmount}`;
}

/**
 * Converts number to words (Indian format)
 * @param amount - Amount to convert
 * @returns Amount in words
 */
export function amountToWords(amount: number): string {
	const ones = [
		'', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
		'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
		'seventeen', 'eighteen', 'nineteen'
	];

	const tens = [
		'', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
	];

	function convertBelow1000(num: number): string {
		if (num === 0) return '';
		if (num < 20) return ones[num];
		if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
		return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + convertBelow1000(num % 100) : '');
	}

	function convertAmount(num: number): string {
		if (num === 0) return 'zero';

		const crore = Math.floor(num / 10000000);
		const lakh = Math.floor((num % 10000000) / 100000);
		const thousand = Math.floor((num % 100000) / 1000);
		const remainder = num % 1000;

		let result = '';

		if (crore > 0) result += convertBelow1000(crore) + ' crore ';
		if (lakh > 0) result += convertBelow1000(lakh) + ' lakh ';
		if (thousand > 0) result += convertBelow1000(thousand) + ' thousand ';
		if (remainder > 0) result += convertBelow1000(remainder);

		return result.trim();
	}

	const rupees = Math.floor(Math.abs(amount));
	const paise = Math.round((Math.abs(amount) - rupees) * 100);

	let result = '';
	if (amount < 0) result += 'minus ';

	if (rupees > 0) {
		result += convertAmount(rupees) + ' rupee';
		if (rupees !== 1) result += 's';
	}

	if (paise > 0) {
		if (rupees > 0) result += ' and ';
		result += convertAmount(paise) + ' paise';
	}

	if (rupees === 0 && paise === 0) result = 'zero rupees';

	return result + ' only';
} 