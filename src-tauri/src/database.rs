// =====================================================
// Payvlo GST Invoice Generator - Database Module
// Rust SQLite Data Access Layer
// =====================================================

use rusqlite::{Connection, Result as SqliteResult, Row, params};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::AppHandle;

// =====================================================
// Database Models (matching TypeScript types)
// =====================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CompanySettings {
    pub id: Option<i64>,
    pub company_name: String,
    pub gstin: String,
    pub pan: String,
    pub address_line1: String,
    pub address_line2: Option<String>,
    pub city: String,
    pub state: String,
    pub pincode: String,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub bank_name: Option<String>,
    pub account_number: Option<String>,
    pub ifsc_code: Option<String>,
    pub logo_path: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Customer {
    pub id: Option<i64>,
    pub customer_name: String,
    pub gstin: Option<String>,
    pub pan: Option<String>,
    pub customer_type: String, // B2B, B2C, EXPORT
    pub address_line1: String,
    pub address_line2: Option<String>,
    pub city: String,
    pub state: String,
    pub pincode: String,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub credit_limit: f64,
    pub credit_period_days: i32,
    pub is_active: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Product {
    pub id: Option<i64>,
    pub product_code: String,
    pub product_name: String,
    pub description: Option<String>,
    pub hsn_sac_code: String,
    pub product_type: String, // GOODS, SERVICES
    pub unit_of_measurement: String,
    pub rate: f64,
    pub gst_rate: f64,
    pub cess_rate: f64,
    pub is_active: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Invoice {
    pub id: Option<i64>,
    pub invoice_number: String,
    pub invoice_date: String,
    pub customer_id: i64,
    pub invoice_type: String, // REGULAR, EXPORT, DEBIT_NOTE, CREDIT_NOTE
    pub place_of_supply: String,
    pub reverse_charge: bool,
    pub subtotal: f64,
    pub total_discount: f64,
    pub taxable_amount: f64,
    pub cgst_amount: f64,
    pub sgst_amount: f64,
    pub igst_amount: f64,
    pub cess_amount: f64,
    pub total_tax: f64,
    pub total_amount: f64,
    pub round_off: f64,
    pub final_amount: f64,
    pub payment_terms: Option<String>,
    pub due_date: Option<String>,
    pub status: String, // DRAFT, SENT, PAID, OVERDUE, CANCELLED
    pub notes: Option<String>,
    pub terms_conditions: Option<String>,
    pub pdf_path: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InvoiceItem {
    pub id: Option<i64>,
    pub invoice_id: i64,
    pub product_id: i64,
    pub line_number: i32,
    pub product_code: String,
    pub product_name: String,
    pub description: Option<String>,
    pub hsn_sac_code: String,
    pub quantity: f64,
    pub unit_price: f64,
    pub discount_percent: f64,
    pub discount_amount: f64,
    pub taxable_amount: f64,
    pub gst_rate: f64,
    pub cgst_rate: f64,
    pub sgst_rate: f64,
    pub igst_rate: f64,
    pub cess_rate: f64,
    pub cgst_amount: f64,
    pub sgst_amount: f64,
    pub igst_amount: f64,
    pub cess_amount: f64,
    pub total_tax: f64,
    pub line_total: f64,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IndianState {
    pub id: Option<i64>,
    pub state_code: String,
    pub state_name: String,
    pub is_union_territory: bool,
    pub is_active: bool,
}

// =====================================================
// Database Connection and Initialization
// =====================================================

pub struct Database {
    pub connection: Connection,
}

impl Database {
    /// Creates a new database connection
    pub fn new(db_path: &Path) -> SqliteResult<Self> {
        let connection = Connection::open(db_path)?;
        
        // Enable foreign key constraints
        connection.execute("PRAGMA foreign_keys = ON", [])?;
        
        Ok(Database { connection })
    }

    /// Initialize database with schema
    pub fn initialize_schema(&self) -> SqliteResult<()> {
        // Read and execute schema.sql
        let schema_sql = include_str!("../../../src/lib/database/schema.sql");
        self.connection.execute_batch(schema_sql)?;
        Ok(())
    }

    /// Get database file path for the app
    pub fn get_db_path(app_handle: &AppHandle) -> Result<std::path::PathBuf, Box<dyn std::error::Error>> {
        let app_data_dir = app_handle
            .path_resolver()
            .app_data_dir()
            .ok_or("Failed to get app data directory")?;
            
        std::fs::create_dir_all(&app_data_dir)?;
        Ok(app_data_dir.join("payvlo.db"))
    }
}

// =====================================================
// Helper Functions for Row Mapping
// =====================================================

impl CompanySettings {
    pub fn from_row(row: &Row) -> SqliteResult<Self> {
        Ok(CompanySettings {
            id: Some(row.get(0)?),
            company_name: row.get(1)?,
            gstin: row.get(2)?,
            pan: row.get(3)?,
            address_line1: row.get(4)?,
            address_line2: row.get(5)?,
            city: row.get(6)?,
            state: row.get(7)?,
            pincode: row.get(8)?,
            phone: row.get(9)?,
            email: row.get(10)?,
            website: row.get(11)?,
            bank_name: row.get(12)?,
            account_number: row.get(13)?,
            ifsc_code: row.get(14)?,
            logo_path: row.get(15)?,
            created_at: row.get(16)?,
            updated_at: row.get(17)?,
        })
    }
}

impl Customer {
    pub fn from_row(row: &Row) -> SqliteResult<Self> {
        Ok(Customer {
            id: Some(row.get(0)?),
            customer_name: row.get(1)?,
            gstin: row.get(2)?,
            pan: row.get(3)?,
            customer_type: row.get(4)?,
            address_line1: row.get(5)?,
            address_line2: row.get(6)?,
            city: row.get(7)?,
            state: row.get(8)?,
            pincode: row.get(9)?,
            phone: row.get(10)?,
            email: row.get(11)?,
            credit_limit: row.get(12)?,
            credit_period_days: row.get(13)?,
            is_active: row.get(14)?,
            created_at: row.get(15)?,
            updated_at: row.get(16)?,
        })
    }
}

impl Product {
    pub fn from_row(row: &Row) -> SqliteResult<Self> {
        Ok(Product {
            id: Some(row.get(0)?),
            product_code: row.get(1)?,
            product_name: row.get(2)?,
            description: row.get(3)?,
            hsn_sac_code: row.get(4)?,
            product_type: row.get(5)?,
            unit_of_measurement: row.get(6)?,
            rate: row.get(7)?,
            gst_rate: row.get(8)?,
            cess_rate: row.get(9)?,
            is_active: row.get(10)?,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
        })
    }
}

impl Invoice {
    pub fn from_row(row: &Row) -> SqliteResult<Self> {
        Ok(Invoice {
            id: Some(row.get(0)?),
            invoice_number: row.get(1)?,
            invoice_date: row.get(2)?,
            customer_id: row.get(3)?,
            invoice_type: row.get(4)?,
            place_of_supply: row.get(5)?,
            reverse_charge: row.get(6)?,
            subtotal: row.get(7)?,
            total_discount: row.get(8)?,
            taxable_amount: row.get(9)?,
            cgst_amount: row.get(10)?,
            sgst_amount: row.get(11)?,
            igst_amount: row.get(12)?,
            cess_amount: row.get(13)?,
            total_tax: row.get(14)?,
            total_amount: row.get(15)?,
            round_off: row.get(16)?,
            final_amount: row.get(17)?,
            payment_terms: row.get(18)?,
            due_date: row.get(19)?,
            status: row.get(20)?,
            notes: row.get(21)?,
            terms_conditions: row.get(22)?,
            pdf_path: row.get(23)?,
            created_at: row.get(24)?,
            updated_at: row.get(25)?,
        })
    }
}

impl InvoiceItem {
    pub fn from_row(row: &Row) -> SqliteResult<Self> {
        Ok(InvoiceItem {
            id: Some(row.get(0)?),
            invoice_id: row.get(1)?,
            product_id: row.get(2)?,
            line_number: row.get(3)?,
            product_code: row.get(4)?,
            product_name: row.get(5)?,
            description: row.get(6)?,
            hsn_sac_code: row.get(7)?,
            quantity: row.get(8)?,
            unit_price: row.get(9)?,
            discount_percent: row.get(10)?,
            discount_amount: row.get(11)?,
            taxable_amount: row.get(12)?,
            gst_rate: row.get(13)?,
            cgst_rate: row.get(14)?,
            sgst_rate: row.get(15)?,
            igst_rate: row.get(16)?,
            cess_rate: row.get(17)?,
            cgst_amount: row.get(18)?,
            sgst_amount: row.get(19)?,
            igst_amount: row.get(20)?,
            cess_amount: row.get(21)?,
            total_tax: row.get(22)?,
            line_total: row.get(23)?,
            created_at: row.get(24)?,
        })
    }
}

impl IndianState {
    pub fn from_row(row: &Row) -> SqliteResult<Self> {
        Ok(IndianState {
            id: Some(row.get(0)?),
            state_code: row.get(1)?,
            state_name: row.get(2)?,
            is_union_territory: row.get(3)?,
            is_active: row.get(4)?,
        })
    }
}

// =====================================================
// CRUD Operations - Company Settings
// =====================================================

impl Database {
    pub fn get_company_settings(&self) -> SqliteResult<Option<CompanySettings>> {
        let mut stmt = self.connection.prepare(
            "SELECT * FROM company_settings ORDER BY id DESC LIMIT 1"
        )?;
        
        let result = stmt.query_row([], |row| CompanySettings::from_row(row));
        
        match result {
            Ok(settings) => Ok(Some(settings)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn save_company_settings(&self, settings: &CompanySettings) -> SqliteResult<i64> {
        if let Some(id) = settings.id {
            // Update existing
            self.connection.execute(
                "UPDATE company_settings SET 
                 company_name = ?1, gstin = ?2, pan = ?3, address_line1 = ?4,
                 address_line2 = ?5, city = ?6, state = ?7, pincode = ?8,
                 phone = ?9, email = ?10, website = ?11, bank_name = ?12,
                 account_number = ?13, ifsc_code = ?14, logo_path = ?15,
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?16",
                params![
                    settings.company_name, settings.gstin, settings.pan, settings.address_line1,
                    settings.address_line2, settings.city, settings.state, settings.pincode,
                    settings.phone, settings.email, settings.website, settings.bank_name,
                    settings.account_number, settings.ifsc_code, settings.logo_path, id
                ],
            )?;
            Ok(id)
        } else {
            // Insert new
            self.connection.execute(
                "INSERT INTO company_settings 
                 (company_name, gstin, pan, address_line1, address_line2, city, state, pincode,
                  phone, email, website, bank_name, account_number, ifsc_code, logo_path)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
                params![
                    settings.company_name, settings.gstin, settings.pan, settings.address_line1,
                    settings.address_line2, settings.city, settings.state, settings.pincode,
                    settings.phone, settings.email, settings.website, settings.bank_name,
                    settings.account_number, settings.ifsc_code, settings.logo_path
                ],
            )?;
            Ok(self.connection.last_insert_rowid())
        }
    }
}

// =====================================================
// CRUD Operations - Customers
// =====================================================

impl Database {
    pub fn get_customers(&self, limit: Option<i32>, offset: Option<i32>) -> SqliteResult<Vec<Customer>> {
        let limit = limit.unwrap_or(100);
        let offset = offset.unwrap_or(0);
        
        let mut stmt = self.connection.prepare(
            "SELECT * FROM customers ORDER BY customer_name ASC LIMIT ?1 OFFSET ?2"
        )?;
        
        let rows = stmt.query_map(params![limit, offset], |row| Customer::from_row(row))?;
        let mut customers = Vec::new();
        
        for row in rows {
            customers.push(row?);
        }
        
        Ok(customers)
    }

    pub fn get_customer_by_id(&self, id: i64) -> SqliteResult<Option<Customer>> {
        let mut stmt = self.connection.prepare("SELECT * FROM customers WHERE id = ?1")?;
        
        let result = stmt.query_row(params![id], |row| Customer::from_row(row));
        
        match result {
            Ok(customer) => Ok(Some(customer)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn save_customer(&self, customer: &Customer) -> SqliteResult<i64> {
        if let Some(id) = customer.id {
            // Update existing
            self.connection.execute(
                "UPDATE customers SET 
                 customer_name = ?1, gstin = ?2, pan = ?3, customer_type = ?4,
                 address_line1 = ?5, address_line2 = ?6, city = ?7, state = ?8, pincode = ?9,
                 phone = ?10, email = ?11, credit_limit = ?12, credit_period_days = ?13,
                 is_active = ?14, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?15",
                params![
                    customer.customer_name, customer.gstin, customer.pan, customer.customer_type,
                    customer.address_line1, customer.address_line2, customer.city, customer.state,
                    customer.pincode, customer.phone, customer.email, customer.credit_limit,
                    customer.credit_period_days, customer.is_active, id
                ],
            )?;
            Ok(id)
        } else {
            // Insert new
            self.connection.execute(
                "INSERT INTO customers 
                 (customer_name, gstin, pan, customer_type, address_line1, address_line2,
                  city, state, pincode, phone, email, credit_limit, credit_period_days, is_active)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
                params![
                    customer.customer_name, customer.gstin, customer.pan, customer.customer_type,
                    customer.address_line1, customer.address_line2, customer.city, customer.state,
                    customer.pincode, customer.phone, customer.email, customer.credit_limit,
                    customer.credit_period_days, customer.is_active
                ],
            )?;
            Ok(self.connection.last_insert_rowid())
        }
    }

    pub fn delete_customer(&self, id: i64) -> SqliteResult<bool> {
        let rows_affected = self.connection.execute("DELETE FROM customers WHERE id = ?1", params![id])?;
        Ok(rows_affected > 0)
    }

    pub fn search_customers(&self, query: &str) -> SqliteResult<Vec<Customer>> {
        let search_pattern = format!("%{}%", query);
        let mut stmt = self.connection.prepare(
            "SELECT * FROM customers 
             WHERE customer_name LIKE ?1 OR gstin LIKE ?1 OR phone LIKE ?1 OR email LIKE ?1
             ORDER BY customer_name ASC"
        )?;
        
        let rows = stmt.query_map(params![search_pattern], |row| Customer::from_row(row))?;
        let mut customers = Vec::new();
        
        for row in rows {
            customers.push(row?);
        }
        
        Ok(customers)
    }
}

// =====================================================
// CRUD Operations - Products
// =====================================================

impl Database {
    pub fn get_products(&self, limit: Option<i32>, offset: Option<i32>) -> SqliteResult<Vec<Product>> {
        let limit = limit.unwrap_or(100);
        let offset = offset.unwrap_or(0);
        
        let mut stmt = self.connection.prepare(
            "SELECT * FROM products WHERE is_active = 1 ORDER BY product_name ASC LIMIT ?1 OFFSET ?2"
        )?;
        
        let rows = stmt.query_map(params![limit, offset], |row| Product::from_row(row))?;
        let mut products = Vec::new();
        
        for row in rows {
            products.push(row?);
        }
        
        Ok(products)
    }

    pub fn get_product_by_id(&self, id: i64) -> SqliteResult<Option<Product>> {
        let mut stmt = self.connection.prepare("SELECT * FROM products WHERE id = ?1")?;
        
        let result = stmt.query_row(params![id], |row| Product::from_row(row));
        
        match result {
            Ok(product) => Ok(Some(product)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn save_product(&self, product: &Product) -> SqliteResult<i64> {
        if let Some(id) = product.id {
            // Update existing
            self.connection.execute(
                "UPDATE products SET 
                 product_code = ?1, product_name = ?2, description = ?3, hsn_sac_code = ?4,
                 product_type = ?5, unit_of_measurement = ?6, rate = ?7, gst_rate = ?8,
                 cess_rate = ?9, is_active = ?10, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?11",
                params![
                    product.product_code, product.product_name, product.description, product.hsn_sac_code,
                    product.product_type, product.unit_of_measurement, product.rate, product.gst_rate,
                    product.cess_rate, product.is_active, id
                ],
            )?;
            Ok(id)
        } else {
            // Insert new
            self.connection.execute(
                "INSERT INTO products 
                 (product_code, product_name, description, hsn_sac_code, product_type,
                  unit_of_measurement, rate, gst_rate, cess_rate, is_active)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                params![
                    product.product_code, product.product_name, product.description, product.hsn_sac_code,
                    product.product_type, product.unit_of_measurement, product.rate, product.gst_rate,
                    product.cess_rate, product.is_active
                ],
            )?;
            Ok(self.connection.last_insert_rowid())
        }
    }

    pub fn delete_product(&self, id: i64) -> SqliteResult<bool> {
        let rows_affected = self.connection.execute(
            "UPDATE products SET is_active = 0 WHERE id = ?1", 
            params![id]
        )?;
        Ok(rows_affected > 0)
    }

    pub fn search_products(&self, query: &str) -> SqliteResult<Vec<Product>> {
        let search_pattern = format!("%{}%", query);
        let mut stmt = self.connection.prepare(
            "SELECT * FROM products 
             WHERE is_active = 1 AND (product_name LIKE ?1 OR product_code LIKE ?1 OR hsn_sac_code LIKE ?1)
             ORDER BY product_name ASC"
        )?;
        
        let rows = stmt.query_map(params![search_pattern], |row| Product::from_row(row))?;
        let mut products = Vec::new();
        
        for row in rows {
            products.push(row?);
        }
        
        Ok(products)
    }
}

// =====================================================
// CRUD Operations - Indian States
// =====================================================

impl Database {
    pub fn get_indian_states(&self) -> SqliteResult<Vec<IndianState>> {
        let mut stmt = self.connection.prepare(
            "SELECT * FROM indian_states WHERE is_active = 1 ORDER BY state_name ASC"
        )?;
        
        let rows = stmt.query_map([], |row| IndianState::from_row(row))?;
        let mut states = Vec::new();
        
        for row in rows {
            states.push(row?);
        }
        
        Ok(states)
    }

    pub fn get_state_by_code(&self, state_code: &str) -> SqliteResult<Option<IndianState>> {
        let mut stmt = self.connection.prepare("SELECT * FROM indian_states WHERE state_code = ?1")?;
        
        let result = stmt.query_row(params![state_code], |row| IndianState::from_row(row));
        
        match result {
            Ok(state) => Ok(Some(state)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }
}

// =====================================================
// Utility Functions
// =====================================================

impl Database {
    pub fn count_records(&self, table: &str) -> SqliteResult<i64> {
        let query = format!("SELECT COUNT(*) FROM {}", table);
        let count: i64 = self.connection.query_row(&query, [], |row| row.get(0))?;
        Ok(count)
    }

    pub fn get_next_invoice_number(&self, format: &str) -> SqliteResult<String> {
        // Get the last invoice number
        let mut stmt = self.connection.prepare(
            "SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1"
        )?;
        
        let last_number = stmt.query_row([], |row| {
            let number: String = row.get(0)?;
            Ok(number)
        });
        
        let last_number_str = match last_number {
            Ok(num) => Some(num),
            Err(rusqlite::Error::QueryReturnedNoRows) => None,
            Err(e) => return Err(e),
        };
        
        // Generate next number (this would use the same logic as the TypeScript version)
        // For now, return a simple incremented format
        let current_year = chrono::Utc::now().year();
        let current_month = chrono::Utc::now().month();
        
        if let Some(last) = last_number_str {
            // Extract number from last invoice and increment
            if let Some(captures) = regex::Regex::new(r"(\d+)$").unwrap().captures(&last) {
                if let Some(num_str) = captures.get(1) {
                    let num: u32 = num_str.as_str().parse().unwrap_or(0);
                    return Ok(format!("INV-{}-{:02}-{:04}", current_year, current_month, num + 1));
                }
            }
        }
        
        // First invoice
        Ok(format!("INV-{}-{:02}-0001", current_year, current_month))
    }
} 