# GST Compliance Guide

## Overview

This document provides comprehensive guidance on implementing GST (Goods and Services Tax) compliance for invoice generation in India. Payvlo follows all CBIC (Central Board of Indirect Taxes and Customs) guidelines to ensure legal compliance.

## 🇮🇳 Indian GST System

### GST Structure

India's GST system consists of three main components:

- **CGST** (Central GST): Collected by Central Government
- **SGST** (State GST): Collected by State Government
- **IGST** (Integrated GST): For inter-state transactions

### Tax Calculation Rules

#### Intra-State Transactions

When supplier and recipient are in the same state:

- **CGST**: 50% of total GST rate
- **SGST**: 50% of total GST rate
- **IGST**: 0%

```typescript
// Example: 18% GST on ₹10,000
// CGST = 10,000 × (18/2)/100 = ₹900
// SGST = 10,000 × (18/2)/100 = ₹900
// Total Tax = ₹1,800
```

#### Inter-State Transactions

When supplier and recipient are in different states:

- **CGST**: 0%
- **SGST**: 0%
- **IGST**: Full GST rate

```typescript
// Example: 18% GST on ₹10,000
// IGST = 10,000 × 18/100 = ₹1,800
// Total Tax = ₹1,800
```

### GST Rates

| Rate | Description       | Examples                         |
| ---- | ----------------- | -------------------------------- |
| 0%   | Essential items   | Fresh fruits, vegetables, milk   |
| 5%   | Daily necessities | Household items, basic food      |
| 12%  | Processed items   | Processed food, some electronics |
| 18%  | Standard rate     | Most goods and services          |
| 28%  | Luxury items      | Automobiles, luxury goods        |

## 📋 Invoice Requirements

### Mandatory Fields

Every GST invoice must contain the following information:

#### Supplier Details

```typescript
interface SupplierDetails {
	name: string; // Legal business name
	gstin: string; // 15-digit GSTIN
	address: {
		building: string;
		street: string;
		locality: string;
		city: string;
		state: string;
		pincode: string;
	};
	email?: string;
	phone?: string;
}
```

#### Recipient Details

```typescript
interface RecipientDetails {
	name: string; // Customer name
	gstin?: string; // Required for B2B, optional for B2C
	address: {
		building: string;
		street: string;
		locality: string;
		city: string;
		state: string;
		pincode: string;
	};
	state_code: string; // For place of supply
}
```

#### Invoice Information

```typescript
interface InvoiceInfo {
	invoice_number: string; // Sequential, unique
	invoice_date: string; // DD/MM/YYYY format
	place_of_supply: string; // State name or state code
	reverse_charge?: boolean; // If applicable
}
```

#### Line Items

```typescript
interface LineItem {
	sr_no: number; // Serial number
	description: string; // Product/service description
	hsn_sac_code: string; // HSN for goods, SAC for services
	quantity: number;
	unit: string; // UOM (Unit of Measurement)
	rate: number; // Rate per unit
	amount: number; // Quantity × Rate
	discount?: number; // If applicable
	taxable_value: number; // After discount
	gst_rate: number; // GST percentage
	cgst_amount: number;
	sgst_amount: number;
	igst_amount: number;
	total_amount: number; // Including tax
}
```

#### Tax Summary

```typescript
interface TaxSummary {
	total_taxable_value: number;
	total_cgst: number;
	total_sgst: number;
	total_igst: number;
	total_tax: number;
	total_invoice_value: number;
	amount_in_words: string; // Total amount in words
}
```

### Invoice Format Requirements

#### Header Section

```
TAX INVOICE
(Original for Recipient / Duplicate for Transporter / Triplicate for Supplier)
```

#### Invoice Number Format

- Must be sequential and continuous
- Format: PREFIX-YYYY-NNNNNN (e.g., INV-2024-000001)
- No gaps or duplicates allowed

#### Date Format

- Standard format: DD/MM/YYYY
- Must be the date of supply

## 🏷️ HSN/SAC Codes

### HSN (Harmonized System of Nomenclature)

Used for goods classification:

#### Medical Equipment Examples

| HSN Code | Description                              | GST Rate |
| -------- | ---------------------------------------- | -------- |
| 90181100 | Electro-cardiographs                     | 12%      |
| 90181900 | Other electro-diagnostic apparatus       | 12%      |
| 90192000 | Ozone, oxygen, aerosol therapy apparatus | 12%      |
| 90211000 | Orthopaedic or fracture appliances       | 5%       |
| 90189099 | Other medical instruments                | 12%      |

### SAC (Services Accounting Code)

Used for services classification:

#### Common Service Codes

| SAC Code | Description                     | GST Rate |
| -------- | ------------------------------- | -------- |
| 997212   | Maintenance and repair services | 18%      |
| 997331   | Installation services           | 18%      |
| 998314   | Training services               | 18%      |
| 998399   | Other professional services     | 18%      |

### Implementation in Payvlo

```typescript
// HSN/SAC validation
function validateHsnSacCode(code: string, isService: boolean): boolean {
	if (isService) {
		// SAC codes are 6 digits
		return /^\d{6}$/.test(code);
	} else {
		// HSN codes can be 4, 6, or 8 digits
		return /^\d{4}(\d{2})?(\d{2})?$/.test(code);
	}
}

// Get GST rate for HSN/SAC code
async function getGstRateForCode(hsnSacCode: string): Promise<number> {
	// Implementation would query database or API
	const rates = await invoke('get_gst_rate_for_hsn_sac', { code: hsnSacCode });
	return rates.gst_rate;
}
```

## 🔢 GSTIN Validation

### GSTIN Format

GSTIN is a 15-character alphanumeric code:

```
Position 1-2:  State Code (01-37)
Position 3-12: PAN of entity (10 characters)
Position 13:   Entity number (1-9, A-Z)
Position 14:   Check digit (calculated)
Position 15:   'Z' (default)
```

### Validation Algorithm

```typescript
function validateGstin(gstin: string): GstinValidation {
	if (!gstin || gstin.length !== 15) {
		return { is_valid: false, errors: ['GSTIN must be 15 characters'] };
	}

	const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
	if (!pattern.test(gstin)) {
		return { is_valid: false, errors: ['Invalid GSTIN format'] };
	}

	// Extract components
	const stateCode = gstin.substring(0, 2);
	const pan = gstin.substring(2, 12);
	const entityNumber = gstin.substring(12, 13);
	const checkDigit = gstin.substring(13, 14);
	const defaultChar = gstin.substring(14, 15);

	// Validate state code
	const validStateCodes = ['01', '02', '03' /* ... all state codes ... */, , '37'];
	if (!validStateCodes.includes(stateCode)) {
		return { is_valid: false, errors: ['Invalid state code'] };
	}

	// Validate check digit
	const calculatedCheckDigit = calculateGstinCheckDigit(gstin.substring(0, 14));
	if (checkDigit !== calculatedCheckDigit) {
		return { is_valid: false, errors: ['Invalid check digit'] };
	}

	return {
		is_valid: true,
		state_code: stateCode,
		pan: pan,
		entity_number: entityNumber,
		check_digit: checkDigit,
		errors: []
	};
}

function calculateGstinCheckDigit(gstin14: string): string {
	const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let sum = 0;

	for (let i = 0; i < 14; i++) {
		const char = gstin14[i];
		const value = chars.indexOf(char);
		const weight = (i % 2) + 1;
		const product = value * weight;
		sum += Math.floor(product / 36) + (product % 36);
	}

	const remainder = sum % 36;
	const checkDigit = (36 - remainder) % 36;
	return chars[checkDigit];
}
```

## 💰 Tax Calculation Implementation

### Complete Calculation Function

```typescript
interface GstCalculationInput {
	items: LineItem[];
	business_state: string;
	place_of_supply: string;
	discount_percentage?: number;
	round_off?: boolean;
}

interface GstCalculationResult {
	items: ProcessedLineItem[];
	subtotal: number;
	total_discount: number;
	taxable_amount: number;
	cgst_total: number;
	sgst_total: number;
	igst_total: number;
	tax_total: number;
	round_off_amount: number;
	grand_total: number;
	amount_in_words: string;
}

function calculateInvoiceGst(input: GstCalculationInput): GstCalculationResult {
	const isInterState = input.business_state !== input.place_of_supply;
	let subtotal = 0;
	let totalDiscount = 0;
	let taxableAmount = 0;
	let cgstTotal = 0;
	let sgstTotal = 0;
	let igstTotal = 0;

	const processedItems = input.items.map((item) => {
		// Calculate line amount
		const lineAmount = item.quantity * item.rate;
		subtotal += lineAmount;

		// Apply discount
		const discountAmount = item.discount || 0;
		const taxableLineAmount = lineAmount - discountAmount;
		totalDiscount += discountAmount;
		taxableAmount += taxableLineAmount;

		// Calculate GST
		const gstAmount = taxableLineAmount * (item.gst_rate / 100);

		let cgst = 0,
			sgst = 0,
			igst = 0;

		if (isInterState) {
			igst = gstAmount;
			igstTotal += igst;
		} else {
			cgst = gstAmount / 2;
			sgst = gstAmount / 2;
			cgstTotal += cgst;
			sgstTotal += sgst;
		}

		return {
			...item,
			line_amount: lineAmount,
			discount_amount: discountAmount,
			taxable_amount: taxableLineAmount,
			cgst_amount: cgst,
			sgst_amount: sgst,
			igst_amount: igst,
			total_amount: taxableLineAmount + gstAmount
		};
	});

	const taxTotal = cgstTotal + sgstTotal + igstTotal;
	const grandTotalBeforeRounding = taxableAmount + taxTotal;

	// Round off to nearest rupee
	const roundOffAmount = input.round_off
		? Math.round(grandTotalBeforeRounding) - grandTotalBeforeRounding
		: 0;

	const grandTotal = grandTotalBeforeRounding + roundOffAmount;

	return {
		items: processedItems,
		subtotal,
		total_discount: totalDiscount,
		taxable_amount: taxableAmount,
		cgst_total: cgstTotal,
		sgst_total: sgstTotal,
		igst_total: igstTotal,
		tax_total: taxTotal,
		round_off_amount: roundOffAmount,
		grand_total: grandTotal,
		amount_in_words: convertAmountToWords(grandTotal)
	};
}
```

### Amount to Words Conversion

```typescript
function convertAmountToWords(amount: number): string {
	const ones = [
		'',
		'One',
		'Two',
		'Three',
		'Four',
		'Five',
		'Six',
		'Seven',
		'Eight',
		'Nine',
		'Ten',
		'Eleven',
		'Twelve',
		'Thirteen',
		'Fourteen',
		'Fifteen',
		'Sixteen',
		'Seventeen',
		'Eighteen',
		'Nineteen'
	];

	const tens = [
		'',
		'',
		'Twenty',
		'Thirty',
		'Forty',
		'Fifty',
		'Sixty',
		'Seventy',
		'Eighty',
		'Ninety'
	];

	// Implementation for Indian numbering system (Lakhs, Crores)
	const rupees = Math.floor(amount);
	const paise = Math.round((amount - rupees) * 100);

	let words = convertNumberToWords(rupees);
	words += rupees === 1 ? ' Rupee' : ' Rupees';

	if (paise > 0) {
		words += ' and ' + convertNumberToWords(paise);
		words += paise === 1 ? ' Paisa' : ' Paise';
	}

	return words + ' Only';
}
```

## 📄 PDF Invoice Template

### Required Sections

#### 1. Header

```
Company Logo                                    TAX INVOICE
Company Name                                    Original for Recipient
GSTIN: XXXXXXXXXXXX                           Invoice No: INV-2024-000001
Address                                         Date: 15/01/2024
```

#### 2. Billing Information

```
Bill To:                           Ship To: (if different)
Customer Name                      Delivery Name
GSTIN: XXXXXXXXXXXX              Address
Address
Place of Supply: State Name
```

#### 3. Invoice Items Table

```
Sr | Description | HSN/SAC | Qty | Unit | Rate | Amount | Disc | Taxable | GST% | CGST | SGST | IGST | Total
---|-------------|---------|-----|------|------|--------|------|---------|------|------|------|------|-------
1  | Product A   | 123456  | 2   | Pcs  | 1000 | 2000   | 0    | 2000    | 18%  | 180  | 180  | 0    | 2360
```

#### 4. Tax Summary

```
                                        Taxable Amount: ₹2,000.00
                                        CGST @ 9%:      ₹180.00
                                        SGST @ 9%:      ₹180.00
                                        IGST @ 18%:     ₹0.00
                                        Round Off:      ₹0.00
                                        Total Amount:   ₹2,360.00
```

#### 5. Footer

```
Amount in Words: Two Thousand Three Hundred and Sixty Rupees Only

Terms & Conditions:
1. Payment due within 30 days
2. Late payment charges applicable

Authorized Signatory                           Company Seal
```

## ⚖️ Legal Compliance

### Invoice Retention

- **Physical invoices**: 6 years from due date
- **Digital invoices**: 6 years in readable format
- **Backup required**: Multiple copies recommended

### Sequential Numbering

- Invoice numbers must be sequential
- No gaps or duplicates allowed
- Separate series for different types of documents

### Cancellation Rules

- Cancelled invoices must retain original number
- Mark clearly as "CANCELLED"
- Issue credit note if required
- Maintain audit trail

### Amendment Procedures

- Original invoice cannot be modified
- Issue supplementary invoice for additions
- Issue credit note for reductions
- Link all related documents

## 🔍 Validation Checklist

### Before Invoice Generation

- [ ] Valid GSTIN for supplier
- [ ] Valid GSTIN for recipient (if B2B)
- [ ] Correct HSN/SAC codes
- [ ] Accurate GST rates
- [ ] Proper place of supply
- [ ] Sequential invoice numbering

### GST Calculation Verification

- [ ] Correct intra/inter-state determination
- [ ] Accurate CGST/SGST split
- [ ] Proper IGST calculation
- [ ] Discount application
- [ ] Round-off handling

### Invoice Format Compliance

- [ ] All mandatory fields present
- [ ] Proper date format
- [ ] Correct address format
- [ ] Tax summary accuracy
- [ ] Amount in words

## 🚨 Common Errors to Avoid

### Calculation Errors

1. **Incorrect state determination**: Always verify supplier and recipient states
2. **Wrong GST rates**: Use latest rate charts from CBIC
3. **CGST/SGST split**: Must be exactly 50-50 for intra-state
4. **Round-off mistakes**: Apply only to final amount

### Format Errors

1. **Missing mandatory fields**: Use validation checklist
2. **Incorrect date format**: Always use DD/MM/YYYY
3. **Invalid GSTIN**: Implement proper validation
4. **Wrong HSN/SAC**: Verify from official database

### Process Errors

1. **Non-sequential numbering**: Maintain proper sequence
2. **Duplicate invoices**: Check before generation
3. **Missing backup**: Ensure data retention
4. **Improper cancellation**: Follow correct procedure

## 🔗 External Resources

### Official Sources

- [CBIC Official Website](https://www.cbic.gov.in/)
- [GST Portal](https://www.gst.gov.in/)
- [HSN/SAC Search](https://services.gst.gov.in/services/searchhsnsac)

### Rate Charts

- [Current GST Rates](https://www.cbic.gov.in/resources//htdocs-cbec/gst/Tariff-2017.pdf)
- [HSN Classification](https://www.cbic.gov.in/resources//htdocs-cbec/gst/hsn-classification.pdf)

### Updates

- GST rates change periodically
- Monitor CBIC notifications
- Update HSN/SAC database regularly
- Subscribe to GST news sources

---

**Note**: This guide is based on current GST regulations as of 2024. Always refer to the latest CBIC notifications and consult with tax professionals for complex scenarios.
