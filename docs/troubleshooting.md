# Troubleshooting Guide - Payvlo GST Invoice Generator

**Last Updated**: 2025-06-28  
**Status**: Auto-generated from [plan.md](../plan.md)

## 📋 Table of Contents

1. [Common Issues](#common-issues)
2. [Installation Problems](#installation-problems)
3. [GST Calculation Problems](#gst-calculation-problems)
4. [Database Issues](#database-issues)
5. [PDF Generation Problems](#pdf-generation-problems)
6. [Cross-Platform Issues](#cross-platform-issues)
7. [Performance Problems](#performance-problems)
8. [Debugging Procedures](#debugging-procedures)

## 🚨 Common Issues

### **Application Won't Start**

**Symptoms:**

- Application fails to launch
- Error messages during startup
- White screen or blank window

**Solutions:**

1. **Check System Requirements:**

   ```bash
   # Verify Node.js version (required: 16+)
   node --version

   # Verify Rust installation
   rustc --version
   ```

2. **Clear Application Data:**

   ```bash
   # Windows
   rm -rf %APPDATA%/com.payvlo.gst-invoice-generator

   # macOS
   rm -rf ~/Library/Application\ Support/com.payvlo.gst-invoice-generator

   # Linux
   rm -rf ~/.config/com.payvlo.gst-invoice-generator
   ```

3. **Reinstall Dependencies:**
   ```bash
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

### **Database Connection Failed**

**Symptoms:**

- "Failed to open database" errors
- Data not saving or loading
- Application crashes on data operations

**Solutions:**

1. **Check Database Permissions:**

   ```bash
   # Ensure app data directory exists and is writable
   mkdir -p ~/.config/payvlo
   chmod 755 ~/.config/payvlo
   ```

2. **Reset Database:**
   ```bash
   # Remove corrupted database file
   rm ~/.config/payvlo/payvlo.db
   # Restart application to recreate database
   ```

### **GST Calculations Incorrect**

**Symptoms:**

- Wrong tax amounts calculated
- CGST/SGST/IGST distribution incorrect
- Total amounts don't match expected values

**Solutions:**

1. **Verify Transaction Type:**
   - **Intra-state**: Buyer and seller in same state → CGST + SGST
   - **Inter-state**: Buyer and seller in different states → IGST

2. **Check GST Rate:**

   ```javascript
   // Valid GST rates only: 0, 5, 12, 18, 28
   const validRates = [0, 5, 12, 18, 28];
   ```

3. **Validate GSTIN Format:**
   ```rust
   // Correct GSTIN format: 15 characters
   // Pattern: 2-digit state + 10-character PAN + entity + check + default
   let gstin = "27AAPFU0939F1ZV"; // Example valid GSTIN
   ```

## 🔧 Installation Problems

### **Tauri Installation Issues**

**Problem**: Tauri CLI installation fails

**Solutions:**

1. **Install System Dependencies:**

   **Windows:**
   - Install Microsoft C++ Build Tools
   - Install WebView2 Runtime

   **macOS:**

   ```bash
   xcode-select --install
   ```

   **Linux (Ubuntu/Debian):**

   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.0-dev \
       build-essential \
       curl \
       wget \
       libssl-dev \
       libgtk-3-dev \
       libayatana-appindicator3-dev \
       librsvg2-dev
   ```

2. **Update Rust Toolchain:**
   ```bash
   rustup update stable
   rustup default stable
   cargo install tauri-cli
   ```

### **Node.js Dependencies Issues**

**Problem**: pnpm install fails with peer dependency conflicts

**Solutions:**

1. **Clear Package Manager Cache:**

   ```bash
   pnpm store prune
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

2. **Use Specific Node Version:**
   ```bash
   nvm install 18
   nvm use 18
   pnpm install
   ```

## 📊 GST Calculation Problems

### **GSTIN Validation Failing**

**Problem**: Valid GSTIN rejected by validation

**Solution:**

```typescript
function validateGSTIN(gstin: string): boolean {
	if (gstin.length !== 15) return false;

	const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
	return regex.test(gstin);
}
```

### **Tax Distribution Errors**

**Problem**: CGST/SGST not splitting correctly

**Solution:**

```typescript
const isIntraState = buyerState === sellerState;

if (isIntraState) {
	// CGST + SGST (each half of total GST)
	cgst = totalGST / 2;
	sgst = totalGST / 2;
	igst = 0;
} else {
	// IGST only
	cgst = 0;
	sgst = 0;
	igst = totalGST;
}
```

## 💾 Database Issues

### **Database Corruption**

**Problem**: SQLite database becomes corrupted

**Solutions:**

1. **Check Database Integrity:**

   ```bash
   sqlite3 payvlo.db "PRAGMA integrity_check;"
   ```

2. **Repair Corrupted Database:**

   ```bash
   # Create backup
   cp payvlo.db payvlo_backup.db

   # Attempt repair
   sqlite3 payvlo.db ".recover" > recovered.sql
   sqlite3 payvlo_new.db < recovered.sql
   mv payvlo_new.db payvlo.db
   ```

## 📄 PDF Generation Problems

### **PDF Generation Fails**

**Problem**: PDF creation throws errors or produces empty files

**Solutions:**

1. **Check jsPDF Dependencies:**

   ```bash
   pnpm add jspdf jspdf-autotable
   pnpm list jspdf
   ```

2. **Debug PDF Generation:**
   ```typescript
   try {
   	const pdf = new jsPDF();
   	pdf.text('Test PDF', 10, 10);
   	const pdfBlob = pdf.output('blob');
   	console.log('PDF generated successfully', pdfBlob.size);
   } catch (error) {
   	console.error('PDF generation failed:', error);
   }
   ```

### **PDF Formatting Issues**

**Problem**: PDF layout broken or text overlapping

**Solution:**

```typescript
// Proper page dimension calculations
const pageWidth = pdf.internal.pageSize.getWidth();
const pageHeight = pdf.internal.pageSize.getHeight();
const margin = 20;
const contentWidth = pageWidth - margin * 2;
```

## 🖥️ Cross-Platform Issues

### **Windows-Specific Problems**

**Issue**: Application crashes on Windows

**Solutions:**

1. Check WebView2 installation
2. Add application to antivirus whitelist
3. Run as administrator if permission issues

### **macOS-Specific Problems**

**Issue**: "App is damaged" error

**Solutions:**

```bash
# Remove quarantine attribute
xattr -rd com.apple.quarantine path/to/app.app

# Sign the application
codesign --force --deep --sign - path/to/app.app
```

### **Linux-Specific Problems**

**Issue**: Application won't run on different distributions

**Solutions:**

```bash
# Check for missing libraries
ldd path/to/payvlo | grep "not found"

# Install common missing dependencies
sudo apt install libwebkit2gtk-4.0-37 libgtk-3-0

# Make AppImage executable
chmod +x payvlo.AppImage
```

## ⚡ Performance Problems

### **Slow Application Startup**

**Problem**: Application takes >3 seconds to start

**Solutions:**

1. **Optimize Bundle Size:**

   ```bash
   pnpm run build
   npx vite-bundle-analyzer dist
   ```

2. **Database Optimization:**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_customers_gstin ON customers(gstin);
   CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
   ```

### **High Memory Usage**

**Problem**: Application uses >200MB RAM

**Solutions:**

1. **Monitor Store Subscriptions:**

   ```typescript
   const unsubscribe = store.subscribe((value) => console.log(value));

   // Always unsubscribe in onDestroy
   onDestroy(() => unsubscribe());
   ```

2. **Paginate Large Datasets:**
   ```typescript
   const limit = 50;
   const customers = await invoke('get_customers_paginated', {
   	offset: page * limit,
   	limit
   });
   ```

## 🔍 Debugging Procedures

### **Frontend Debugging**

**Enable Debug Mode:**

```typescript
// Enable detailed logging
if (import.meta.env.DEV) {
	console.log('Debug mode enabled');
	window.debug = {
		stores: { customerStore, invoiceStore },
		api: api
	};
}
```

**Browser DevTools:**

```javascript
// Debug store values
customerStore.subscribe(console.log);

// Monitor API calls
window.addEventListener('tauri://invoke', (e) => {
	console.log('Tauri command:', e.detail);
});
```

### **Backend Debugging**

**Rust Logging:**

```rust
// Add to Cargo.toml
[dependencies]
log = "0.4"
env_logger = "0.10"

// Initialize logger in main.rs
fn main() {
    env_logger::init();
    log::info!("Starting Payvlo application");
}

// Use in commands
#[tauri::command]
async fn debug_command() -> Result<String, String> {
    log::debug!("Debug command called");
    Ok("Debug complete".to_string())
}
```

### **Performance Profiling**

**Measure Performance:**

```typescript
// Frontend timing
const start = performance.now();
// Your code here
const end = performance.now();
console.log(`Operation took ${end - start}ms`);
```

```rust
// Backend timing
use std::time::Instant;

let start = Instant::now();
expensive_operation().await;
let duration = start.elapsed();
log::info!("Operation completed in: {:?}", duration);
```

## 🆘 Getting Help

**Log Locations:**

- **Windows**: `%APPDATA%/com.payvlo.gst-invoice-generator/logs/`
- **macOS**: `~/Library/Logs/com.payvlo.gst-invoice-generator/`
- **Linux**: `~/.local/share/com.payvlo.gst-invoice-generator/logs/`

**When Reporting Issues:**

1. Include operating system and version
2. Application version
3. Steps to reproduce
4. Error messages and logs
5. Expected vs actual behavior
6. Screenshots if applicable

**Log Analysis:**

```bash
# Search for errors
grep -i "error" payvlo.log

# Search for GST-related issues
grep -i "gst.*calculation" payvlo.log

# Monitor logs in real-time
tail -f payvlo.log
```

This troubleshooting guide covers the most common issues you may encounter while developing or using Payvlo GST Invoice Generator. For issues not covered here, please check the project documentation or create a detailed bug report.
