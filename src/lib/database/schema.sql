-- =====================================================
-- Payvlo GST Invoice Generator - Database Schema
-- SQLite Schema for Indian GST Compliance
-- =====================================================

-- Company/Business Settings Table
CREATE TABLE IF NOT EXISTS company_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    gstin TEXT UNIQUE NOT NULL, -- 15-character GSTIN
    pan TEXT NOT NULL, -- 10-character PAN
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    logo_path TEXT, -- Path to company logo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer Management Table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    gstin TEXT, -- Optional for B2C customers
    pan TEXT,
    customer_type TEXT CHECK (customer_type IN ('B2B', 'B2C', 'EXPORT')) DEFAULT 'B2C',
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    credit_period_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product/Service Catalog Table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    description TEXT,
    hsn_sac_code TEXT NOT NULL, -- HSN for goods, SAC for services
    product_type TEXT CHECK (product_type IN ('GOODS', 'SERVICES')) NOT NULL,
    unit_of_measurement TEXT NOT NULL, -- KG, PCS, HOURS, etc.
    rate DECIMAL(15,2) NOT NULL,
    gst_rate DECIMAL(5,2) NOT NULL, -- 0, 5, 12, 18, 28
    cess_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Header Table
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    customer_id INTEGER NOT NULL,
    invoice_type TEXT CHECK (invoice_type IN ('REGULAR', 'EXPORT', 'DEBIT_NOTE', 'CREDIT_NOTE')) DEFAULT 'REGULAR',
    place_of_supply TEXT NOT NULL, -- State name or country for exports
    reverse_charge BOOLEAN DEFAULT 0, -- For reverse charge mechanism
    
    -- Amounts before tax
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_discount DECIMAL(15,2) DEFAULT 0,
    taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Tax amounts
    cgst_amount DECIMAL(15,2) DEFAULT 0,
    sgst_amount DECIMAL(15,2) DEFAULT 0,
    igst_amount DECIMAL(15,2) DEFAULT 0,
    cess_amount DECIMAL(15,2) DEFAULT 0,
    total_tax DECIMAL(15,2) DEFAULT 0,
    
    -- Final amounts
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    round_off DECIMAL(5,2) DEFAULT 0,
    final_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Payment and status
    payment_terms TEXT,
    due_date DATE,
    status TEXT CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')) DEFAULT 'DRAFT',
    
    -- Additional fields
    notes TEXT,
    terms_conditions TEXT,
    pdf_path TEXT, -- Path to generated PDF
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Invoice Line Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    line_number INTEGER NOT NULL, -- For ordering items
    
    -- Product details (snapshot at time of invoice)
    product_code TEXT NOT NULL,
    product_name TEXT NOT NULL,
    description TEXT,
    hsn_sac_code TEXT NOT NULL,
    
    -- Quantity and rates
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    taxable_amount DECIMAL(15,2) NOT NULL,
    
    -- Tax rates and amounts
    gst_rate DECIMAL(5,2) NOT NULL,
    cgst_rate DECIMAL(5,2) DEFAULT 0,
    sgst_rate DECIMAL(5,2) DEFAULT 0,
    igst_rate DECIMAL(5,2) DEFAULT 0,
    cess_rate DECIMAL(5,2) DEFAULT 0,
    
    cgst_amount DECIMAL(15,2) DEFAULT 0,
    sgst_amount DECIMAL(15,2) DEFAULT 0,
    igst_amount DECIMAL(15,2) DEFAULT 0,
    cess_amount DECIMAL(15,2) DEFAULT 0,
    total_tax DECIMAL(15,2) DEFAULT 0,
    
    -- Line total
    line_total DECIMAL(15,2) NOT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- GST Tax Rates Configuration Table
CREATE TABLE IF NOT EXISTS gst_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hsn_sac_code TEXT NOT NULL,
    description TEXT,
    gst_rate DECIMAL(5,2) NOT NULL,
    cess_rate DECIMAL(5,2) DEFAULT 0,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indian States Master Table for GST Compliance
CREATE TABLE IF NOT EXISTS indian_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_code TEXT UNIQUE NOT NULL, -- 2-digit state code for GSTIN
    state_name TEXT UNIQUE NOT NULL,
    is_union_territory BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
);

-- Payment Records Table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('CASH', 'CHEQUE', 'BANK_TRANSFER', 'UPI', 'CARD', 'OTHER')) NOT NULL,
    reference_number TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- =====================================================
-- Indexes for Performance Optimization
-- =====================================================

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_gstin ON customers(gstin);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_hsn ON products(hsn_sac_code);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Invoice indexes
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Invoice items indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items(product_id);

-- GST rates indexes
CREATE INDEX IF NOT EXISTS idx_gst_rates_hsn ON gst_rates(hsn_sac_code);
CREATE INDEX IF NOT EXISTS idx_gst_rates_active ON gst_rates(is_active);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- =====================================================
-- Triggers for Automatic Timestamp Updates
-- =====================================================

-- Company settings updated_at trigger
CREATE TRIGGER IF NOT EXISTS update_company_settings_timestamp 
AFTER UPDATE ON company_settings
FOR EACH ROW
BEGIN
    UPDATE company_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Customers updated_at trigger
CREATE TRIGGER IF NOT EXISTS update_customers_timestamp 
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Products updated_at trigger
CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Invoices updated_at trigger
CREATE TRIGGER IF NOT EXISTS update_invoices_timestamp 
AFTER UPDATE ON invoices
FOR EACH ROW
BEGIN
    UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- Sample Data for Indian States (for GST compliance)
-- =====================================================

INSERT OR IGNORE INTO indian_states (state_code, state_name, is_union_territory) VALUES
('01', 'Jammu and Kashmir', 1),
('02', 'Himachal Pradesh', 0),
('03', 'Punjab', 0),
('04', 'Chandigarh', 1),
('05', 'Uttarakhand', 0),
('06', 'Haryana', 0),
('07', 'Delhi', 1),
('08', 'Rajasthan', 0),
('09', 'Uttar Pradesh', 0),
('10', 'Bihar', 0),
('11', 'Sikkim', 0),
('12', 'Arunachal Pradesh', 0),
('13', 'Nagaland', 0),
('14', 'Manipur', 0),
('15', 'Mizoram', 0),
('16', 'Tripura', 0),
('17', 'Meghalaya', 0),
('18', 'Assam', 0),
('19', 'West Bengal', 0),
('20', 'Jharkhand', 0),
('21', 'Odisha', 0),
('22', 'Chhattisgarh', 0),
('23', 'Madhya Pradesh', 0),
('24', 'Gujarat', 0),
('25', 'Daman and Diu', 1),
('26', 'Dadra and Nagar Haveli', 1),
('27', 'Maharashtra', 0),
('28', 'Andhra Pradesh', 0),
('29', 'Karnataka', 0),
('30', 'Goa', 0),
('31', 'Lakshadweep', 1),
('32', 'Kerala', 0),
('33', 'Tamil Nadu', 0),
('34', 'Puducherry', 1),
('35', 'Andaman and Nicobar Islands', 1),
('36', 'Telangana', 0),
('37', 'Andhra Pradesh (New)', 0),
('38', 'Ladakh', 1);

-- =====================================================
-- Sample GST Rates (Common Categories)
-- =====================================================

INSERT OR IGNORE INTO gst_rates (hsn_sac_code, description, gst_rate, effective_from) VALUES
('1001', 'Wheat', 0.00, '2017-07-01'),
('1006', 'Rice', 0.00, '2017-07-01'),
('0401', 'Milk and cream', 0.00, '2017-07-01'),
('2201', 'Waters, including natural', 12.00, '2017-07-01'),
('3004', 'Medicaments', 12.00, '2017-07-01'),
('4802', 'Paper and paperboard', 12.00, '2017-07-01'),
('6403', 'Footwear', 18.00, '2017-07-01'),
('8517', 'Telephone sets, smartphones', 18.00, '2017-07-01'),
('8703', 'Motor cars', 28.00, '2017-07-01'),
('2402', 'Cigarettes', 28.00, '2017-07-01'),
('998721', 'Legal services', 18.00, '2017-07-01'),
('998722', 'Accounting and bookkeeping services', 18.00, '2017-07-01'),
('998723', 'Information technology services', 18.00, '2017-07-01'),
('998724', 'Business support services', 18.00, '2017-07-01'); 