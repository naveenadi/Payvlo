import { describe, it, expect } from 'vitest';

// Simple utility functions for testing
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR'
	}).format(amount);
}

export function calculateGST(
	amount: number,
	rate: number
): { cgst: number; sgst: number; total: number } {
	const gstAmount = (amount * rate) / 100;
	const cgst = gstAmount / 2;
	const sgst = gstAmount / 2;
	return {
		cgst,
		sgst,
		total: amount + gstAmount
	};
}

// Test cases
describe('Utility Functions', () => {
	it('should format currency correctly', () => {
		expect(formatCurrency(1000)).toBe('₹1,000.00');
		expect(formatCurrency(50000)).toBe('₹50,000.00');
	});

	it('should calculate GST correctly', () => {
		const result = calculateGST(1000, 18);
		expect(result.cgst).toBe(90);
		expect(result.sgst).toBe(90);
		expect(result.total).toBe(1180);
	});

	it('should handle zero amounts', () => {
		const result = calculateGST(0, 18);
		expect(result.cgst).toBe(0);
		expect(result.sgst).toBe(0);
		expect(result.total).toBe(0);
	});
});
