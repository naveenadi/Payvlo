# UI Components Guide

## Overview

This guide documents the reusable UI components used throughout Payvlo. The application uses Skeleton UI as the base component library with custom components built for GST-specific functionality.

## 🎨 Design System

### Color Palette

```css
/* Primary Colors - Indian Invoice Theme */
:root {
	--primary-50: #f0f9ff;
	--primary-100: #e0f2fe;
	--primary-500: #0ea5e9; /* Primary blue */
	--primary-600: #0284c7;
	--primary-700: #0369a1;

	/* Success - GST Green */
	--success-50: #f0fdf4;
	--success-500: #22c55e;
	--success-600: #16a34a;

	/* Warning - Tax Orange */
	--warning-50: #fffbeb;
	--warning-500: #f59e0b;
	--warning-600: #d97706;

	/* Error - Validation Red */
	--error-50: #fef2f2;
	--error-500: #ef4444;
	--error-600: #dc2626;

	/* GST Specific */
	--gst-cgst: #3b82f6; /* Blue for CGST */
	--gst-sgst: #10b981; /* Green for SGST */
	--gst-igst: #f59e0b; /* Orange for IGST */
}
```

### Typography

```css
/* Font Stack */
:root {
	--font-primary: 'Inter', system-ui, sans-serif;
	--font-mono: 'JetBrains Mono', monospace;

	/* Font Sizes */
	--text-xs: 0.75rem; /* 12px */
	--text-sm: 0.875rem; /* 14px */
	--text-base: 1rem; /* 16px */
	--text-lg: 1.125rem; /* 18px */
	--text-xl: 1.25rem; /* 20px */
	--text-2xl: 1.5rem; /* 24px */
	--text-3xl: 1.875rem; /* 30px */
}
```

### Spacing

```css
/* Spacing Scale */
:root {
	--space-1: 0.25rem; /* 4px */
	--space-2: 0.5rem; /* 8px */
	--space-3: 0.75rem; /* 12px */
	--space-4: 1rem; /* 16px */
	--space-6: 1.5rem; /* 24px */
	--space-8: 2rem; /* 32px */
	--space-12: 3rem; /* 48px */
	--space-16: 4rem; /* 64px */
}
```

## 🧩 Core Components

### Button Component

```svelte
<!-- src/lib/components/Button.svelte -->
<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let disabled = false;
	export let loading = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let href: string | undefined = undefined;

	$: tag = href ? 'a' : 'button';
	$: classes = [
		'btn',
		`btn-${variant}`,
		`btn-${size}`,
		disabled && 'btn-disabled',
		loading && 'btn-loading'
	]
		.filter(Boolean)
		.join(' ');
</script>

<svelte:element this={tag} {type} {href} {disabled} class={classes} on:click {...$$restProps}>
	{#if loading}
		<span class="btn-spinner" />
	{/if}
	<slot />
</svelte:element>

<style>
	.btn {
		@apply inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all;
		@apply focus:outline-none focus:ring-2 focus:ring-offset-2;
	}

	.btn-sm {
		@apply px-3 py-1 text-sm;
	}
	.btn-md {
		@apply px-4 py-2 text-base;
	}
	.btn-lg {
		@apply px-6 py-3 text-lg;
	}

	.btn-primary {
		@apply bg-primary-500 text-white hover:bg-primary-600;
		@apply focus:ring-primary-500;
	}

	.btn-secondary {
		@apply bg-gray-200 text-gray-900 hover:bg-gray-300;
		@apply focus:ring-gray-500;
	}

	.btn-success {
		@apply bg-success-500 text-white hover:bg-success-600;
		@apply focus:ring-success-500;
	}

	.btn-warning {
		@apply bg-warning-500 text-white hover:bg-warning-600;
		@apply focus:ring-warning-500;
	}

	.btn-error {
		@apply bg-error-500 text-white hover:bg-error-600;
		@apply focus:ring-error-500;
	}

	.btn-disabled {
		@apply opacity-50 cursor-not-allowed pointer-events-none;
	}

	.btn-loading {
		@apply cursor-wait;
	}

	.btn-spinner {
		@apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
	}
</style>
```

#### Usage Examples

```svelte
<!-- Basic buttons -->
<Button>Default Button</Button>
<Button variant="primary">Primary</Button>
<Button variant="success">Success</Button>

<!-- Loading state -->
<Button loading={isSubmitting}>
	{isSubmitting ? 'Creating...' : 'Create Invoice'}
</Button>

<!-- With click handler -->
<Button on:click={handleSave}>Save Invoice</Button>

<!-- As link -->
<Button href="/invoices">View All Invoices</Button>
```

### Input Component

```svelte
<!-- src/lib/components/Input.svelte -->
<script lang="ts">
	export let type: 'text' | 'email' | 'password' | 'number' | 'tel' = 'text';
	export let value: string | number = '';
	export let placeholder = '';
	export let label = '';
	export let error = '';
	export let required = false;
	export let disabled = false;
	export let readonly = false;
	export let id = '';
	export let name = '';

	let inputElement: HTMLInputElement;

	$: hasError = !!error;
	$: inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="input-group">
	{#if label}
		<label for={inputId} class="input-label" class:required>
			{label}
		</label>
	{/if}

	<input
		bind:this={inputElement}
		bind:value
		{type}
		{placeholder}
		{required}
		{disabled}
		{readonly}
		{name}
		id={inputId}
		class="input"
		class:error={hasError}
		on:input
		on:change
		on:focus
		on:blur
		{...$$restProps}
	/>

	{#if hasError}
		<p class="input-error">{error}</p>
	{/if}
</div>

<style>
	.input-group {
		@apply flex flex-col gap-1;
	}

	.input-label {
		@apply text-sm font-medium text-gray-700;
	}

	.input-label.required::after {
		content: ' *';
		@apply text-error-500;
	}

	.input {
		@apply w-full px-3 py-2 border border-gray-300 rounded-lg;
		@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
		@apply disabled:bg-gray-100 disabled:cursor-not-allowed;
		@apply transition-all duration-200;
	}

	.input.error {
		@apply border-error-500 focus:ring-error-500;
	}

	.input-error {
		@apply text-sm text-error-500;
	}
</style>
```

#### Usage Examples

```svelte
<!-- Basic input -->
<Input label="Customer Name" placeholder="Enter customer name" bind:value={customerName} required />

<!-- With validation -->
<Input
	label="GSTIN"
	placeholder="27AABCU9603R1ZX"
	bind:value={gstin}
	error={gstinError}
	on:input={validateGstin}
/>

<!-- Number input -->
<Input type="number" label="Amount" placeholder="0.00" bind:value={amount} step="0.01" />
```

## 💼 Business Components

### GSTIN Input Component

```svelte
<!-- src/lib/components/GstinInput.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Input from './Input.svelte';
	import { validateGstin } from '$lib/utils/gst';

	export let value = '';
	export let label = 'GSTIN';
	export let required = false;
	export let disabled = false;

	const dispatch = createEventDispatcher<{
		validation: { isValid: boolean; details: any };
	}>();

	let validationResult: any = null;
	let isValidating = false;

	$: error = validationResult?.is_valid === false ? validationResult.errors?.join(', ') : '';

	async function handleInput() {
		if (!value || value.length < 15) {
			validationResult = null;
			return;
		}

		isValidating = true;
		try {
			validationResult = await validateGstin(value);
			dispatch('validation', {
				isValid: validationResult.is_valid,
				details: validationResult
			});
		} catch (err) {
			validationResult = {
				is_valid: false,
				errors: ['Validation failed']
			};
		} finally {
			isValidating = false;
		}
	}
</script>

<div class="gstin-input">
	<Input
		bind:value
		{label}
		{required}
		{disabled}
		{error}
		placeholder="27AABCU9603R1ZX"
		maxlength="15"
		class="uppercase"
		on:input={handleInput}
	/>

	{#if isValidating}
		<div class="validation-status validating">
			<span class="spinner" />
			Validating GSTIN...
		</div>
	{:else if validationResult?.is_valid}
		<div class="validation-status valid">
			✓ Valid GSTIN (State: {validationResult.state_code})
		</div>
	{/if}
</div>

<style>
	.gstin-input :global(.input) {
		text-transform: uppercase;
	}

	.validation-status {
		@apply text-sm mt-1 flex items-center gap-2;
	}

	.validation-status.validating {
		@apply text-gray-600;
	}

	.validation-status.valid {
		@apply text-success-600;
	}

	.spinner {
		@apply w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin;
	}
</style>
```

### GST Summary Card

```svelte
<!-- src/lib/components/GstSummaryCard.svelte -->
<script lang="ts">
	import { formatCurrency } from '$lib/utils/format';

	export let subtotal: number;
	export let cgstTotal: number;
	export let sgstTotal: number;
	export let igstTotal: number;
	export let totalTax: number;
	export let grandTotal: number;
	export let isInterState = false;
</script>

<div class="gst-summary-card">
	<h3 class="title">Tax Summary</h3>

	<div class="summary-row">
		<span class="label">Taxable Amount:</span>
		<span class="amount">{formatCurrency(subtotal)}</span>
	</div>

	{#if isInterState}
		<div class="summary-row gst-row">
			<span class="label">
				<span class="gst-badge igst">IGST</span>
				@ {((igstTotal / subtotal) * 100).toFixed(1)}%:
			</span>
			<span class="amount">{formatCurrency(igstTotal)}</span>
		</div>
	{:else}
		<div class="summary-row gst-row">
			<span class="label">
				<span class="gst-badge cgst">CGST</span>
				@ {((cgstTotal / subtotal) * 100).toFixed(1)}%:
			</span>
			<span class="amount">{formatCurrency(cgstTotal)}</span>
		</div>

		<div class="summary-row gst-row">
			<span class="label">
				<span class="gst-badge sgst">SGST</span>
				@ {((sgstTotal / subtotal) * 100).toFixed(1)}%:
			</span>
			<span class="amount">{formatCurrency(sgstTotal)}</span>
		</div>
	{/if}

	<div class="summary-row total-tax">
		<span class="label">Total Tax:</span>
		<span class="amount">{formatCurrency(totalTax)}</span>
	</div>

	<div class="summary-row grand-total">
		<span class="label">Grand Total:</span>
		<span class="amount">{formatCurrency(grandTotal)}</span>
	</div>
</div>

<style>
	.gst-summary-card {
		@apply bg-gray-50 border border-gray-200 rounded-lg p-4;
	}

	.title {
		@apply text-lg font-semibold text-gray-900 mb-4;
	}

	.summary-row {
		@apply flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0;
	}

	.label {
		@apply text-sm text-gray-600 flex items-center gap-2;
	}

	.amount {
		@apply text-sm font-medium text-gray-900;
	}

	.gst-badge {
		@apply px-2 py-1 rounded text-xs font-bold text-white;
	}

	.gst-badge.cgst {
		background-color: var(--gst-cgst);
	}

	.gst-badge.sgst {
		background-color: var(--gst-sgst);
	}

	.gst-badge.igst {
		background-color: var(--gst-igst);
	}

	.total-tax {
		@apply border-t-2 border-gray-300 mt-2 pt-3;
	}

	.total-tax .label {
		@apply font-medium text-gray-900;
	}

	.total-tax .amount {
		@apply font-semibold;
	}

	.grand-total {
		@apply bg-primary-50 -mx-4 -mb-4 px-4 py-3 rounded-b-lg;
	}

	.grand-total .label {
		@apply text-lg font-bold text-primary-900;
	}

	.grand-total .amount {
		@apply text-lg font-bold text-primary-900;
	}
</style>
```

### Status Badge Component

```svelte
<!-- src/lib/components/StatusBadge.svelte -->
<script lang="ts">
	export let status: 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';
	export let size: 'sm' | 'md' | 'lg' = 'md';

	$: statusConfig = {
		draft: {
			label: 'Draft',
			class: 'status-draft',
			icon: '📝'
		},
		sent: {
			label: 'Sent',
			class: 'status-sent',
			icon: '📤'
		},
		paid: {
			label: 'Paid',
			class: 'status-paid',
			icon: '✅'
		},
		cancelled: {
			label: 'Cancelled',
			class: 'status-cancelled',
			icon: '❌'
		},
		overdue: {
			label: 'Overdue',
			class: 'status-overdue',
			icon: '⚠️'
		}
	}[status];
</script>

<span class="status-badge {statusConfig.class} status-{size}">
	<span class="status-icon">{statusConfig.icon}</span>
	{statusConfig.label}
</span>

<style>
	.status-badge {
		@apply inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium;
	}

	.status-sm {
		@apply px-2 py-0.5 text-xs;
	}

	.status-md {
		@apply px-3 py-1 text-sm;
	}

	.status-lg {
		@apply px-4 py-2 text-base;
	}

	.status-draft {
		@apply bg-gray-100 text-gray-800;
	}

	.status-sent {
		@apply bg-blue-100 text-blue-800;
	}

	.status-paid {
		@apply bg-green-100 text-green-800;
	}

	.status-cancelled {
		@apply bg-red-100 text-red-800;
	}

	.status-overdue {
		@apply bg-orange-100 text-orange-800;
	}

	.status-icon {
		@apply text-xs;
	}
</style>
```

## 📱 Layout Components

### Page Header Component

```svelte
<!-- src/lib/components/PageHeader.svelte -->
<script lang="ts">
	export let title: string;
	export let subtitle: string = '';
	export let breadcrumbs: Array<{ label: string; href?: string }> = [];
</script>

<header class="page-header">
	{#if breadcrumbs.length > 0}
		<nav class="breadcrumbs">
			{#each breadcrumbs as crumb, index}
				{#if crumb.href}
					<a href={crumb.href} class="breadcrumb-link">
						{crumb.label}
					</a>
				{:else}
					<span class="breadcrumb-current">
						{crumb.label}
					</span>
				{/if}

				{#if index < breadcrumbs.length - 1}
					<span class="breadcrumb-separator">/</span>
				{/if}
			{/each}
		</nav>
	{/if}

	<div class="header-content">
		<div class="title-section">
			<h1 class="page-title">{title}</h1>
			{#if subtitle}
				<p class="page-subtitle">{subtitle}</p>
			{/if}
		</div>

		<div class="header-actions">
			<slot name="actions" />
		</div>
	</div>
</header>

<style>
	.page-header {
		@apply mb-8;
	}

	.breadcrumbs {
		@apply flex items-center gap-2 mb-4 text-sm;
	}

	.breadcrumb-link {
		@apply text-primary-600 hover:text-primary-700 underline;
	}

	.breadcrumb-current {
		@apply text-gray-500;
	}

	.breadcrumb-separator {
		@apply text-gray-400;
	}

	.header-content {
		@apply flex justify-between items-start;
	}

	.title-section {
		@apply flex-1;
	}

	.page-title {
		@apply text-3xl font-bold text-gray-900;
	}

	.page-subtitle {
		@apply mt-2 text-lg text-gray-600;
	}

	.header-actions {
		@apply flex items-center gap-3;
	}
</style>
```

## 🎯 Usage Patterns

### Form Validation Pattern

```svelte
<script lang="ts">
	import { writable } from 'svelte/store';
	import { z } from 'zod';

	const schema = z.object({
		name: z.string().min(1, 'Name is required'),
		gstin: z
			.string()
			.regex(
				/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
				'Invalid GSTIN format'
			),
		email: z.string().email('Invalid email format')
	});

	let formData = {
		name: '',
		gstin: '',
		email: ''
	};

	let errors = writable({});

	function validateField(field: string, value: any) {
		try {
			schema.pick({ [field]: true }).parse({ [field]: value });
			errors.update((e) => ({ ...e, [field]: '' }));
		} catch (error) {
			errors.update((e) => ({ ...e, [field]: error.errors[0].message }));
		}
	}
</script>

<form>
	<Input
		label="Customer Name"
		bind:value={formData.name}
		error={$errors.name}
		on:blur={() => validateField('name', formData.name)}
		required
	/>

	<GstinInput
		bind:value={formData.gstin}
		error={$errors.gstin}
		on:validation={(e) => {
			if (!e.detail.isValid) {
				errors.update((err) => ({ ...err, gstin: 'Invalid GSTIN' }));
			} else {
				errors.update((err) => ({ ...err, gstin: '' }));
			}
		}}
		required
	/>
</form>
```

### Data Loading Pattern

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let loading = writable(true);
	let error = writable(null);
	let data = writable([]);

	onMount(async () => {
		try {
			const response = await fetch('/api/customers');
			if (!response.ok) throw new Error('Failed to load data');

			const customers = await response.json();
			data.set(customers);
		} catch (err) {
			error.set(err.message);
		} finally {
			loading.set(false);
		}
	});
</script>

{#if $loading}
	<div class="loading-state">
		<div class="spinner" />
		Loading customers...
	</div>
{:else if $error}
	<div class="error-state">
		<p>Error: {$error}</p>
		<Button on:click={() => window.location.reload()}>Retry</Button>
	</div>
{:else}
	<div class="data-grid">
		{#each $data as customer}
			<CustomerCard {customer} />
		{/each}
	</div>
{/if}
```

## 📚 Component Library

### Available Components

#### Form Components

- `Button` - Multi-variant button with loading states
- `Input` - Text input with validation
- `Select` - Dropdown selection
- `Checkbox` - Boolean input
- `Radio` - Single choice from options
- `Textarea` - Multi-line text input
- `DatePicker` - Date selection
- `NumberInput` - Numeric input with formatting

#### Business Components

- `GstinInput` - GSTIN validation input
- `HsnSacSelector` - HSN/SAC code search
- `ProductSelector` - Product search and selection
- `CustomerSelector` - Customer search and selection
- `InvoiceItemRow` - Invoice line item
- `GstSummaryCard` - Tax calculation display
- `AmountInWords` - Number to words conversion

#### Display Components

- `StatusBadge` - Status indicators
- `DataTable` - Sortable, filterable tables
- `Card` - Content containers
- `Modal` - Dialog overlays
- `Toast` - Notification messages
- `LoadingSpinner` - Loading indicators
- `EmptyState` - No data placeholders

#### Layout Components

- `PageHeader` - Page titles and actions
- `Sidebar` - Navigation sidebar
- `Navbar` - Top navigation
- `Footer` - Page footer
- `Container` - Content containers
- `Grid` - Layout grid system

## 🎨 Customization

### Theme Configuration

```typescript
// src/lib/theme.ts
export const theme = {
	colors: {
		primary: {
			50: '#f0f9ff',
			500: '#0ea5e9',
			600: '#0284c7',
			700: '#0369a1'
		},
		gst: {
			cgst: '#3b82f6',
			sgst: '#10b981',
			igst: '#f59e0b'
		}
	},
	spacing: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '1rem',
		lg: '1.5rem',
		xl: '2rem'
	},
	typography: {
		fontFamily: {
			sans: ['Inter', 'system-ui', 'sans-serif'],
			mono: ['JetBrains Mono', 'monospace']
		}
	}
};
```

### Component Styling

```css
/* src/app.postcss */
@import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
@import '@skeletonlabs/skeleton/styles/skeleton.css';
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom component styles */
.invoice-table {
	@apply w-full border-collapse;
}

.invoice-table th {
	@apply bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.invoice-table td {
	@apply px-3 py-2 text-sm text-gray-900 border-b border-gray-200;
}

/* GST-specific styling */
.gst-amount {
	@apply font-mono text-right;
}

.cgst-amount {
	@apply text-blue-600;
}
.sgst-amount {
	@apply text-green-600;
}
.igst-amount {
	@apply text-orange-600;
}
```

---

This components guide provides a comprehensive overview of the UI components used in Payvlo, along with usage patterns and customization options. All components are designed to be reusable, accessible, and specifically tailored for GST invoice generation workflows.
