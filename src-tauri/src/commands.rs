// =====================================================
// Payvlo GST Invoice Generator - Tauri Commands
// Frontend-Backend Bridge for Database Operations
// =====================================================

use crate::database::{Database, CompanySettings, Customer, Product, IndianState};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, State};

// =====================================================
// Application State Management
// =====================================================

pub struct AppState {
    pub db: Mutex<Option<Database>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            db: Mutex::new(None),
        }
    }
}

// =====================================================
// Error Handling
// =====================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiError {
    pub error: String,
    pub message: String,
}

impl From<rusqlite::Error> for ApiError {
    fn from(err: rusqlite::Error) -> Self {
        ApiError {
            error: "DatabaseError".to_string(),
            message: err.to_string(),
        }
    }
}

impl From<Box<dyn std::error::Error>> for ApiError {
    fn from(err: Box<dyn std::error::Error>) -> Self {
        ApiError {
            error: "GeneralError".to_string(),
            message: err.to_string(),
        }
    }
}

type CommandResult<T> = Result<T, ApiError>;

// =====================================================
// Database Initialization Commands
// =====================================================

#[tauri::command]
pub async fn initialize_database(
    app_handle: AppHandle,
    state: State<'_, AppState>,
) -> CommandResult<bool> {
    // Get database path
    let db_path = Database::get_db_path(&app_handle)?;
    
    // Create database connection
    let db = Database::new(&db_path).map_err(ApiError::from)?;
    
    // Initialize schema
    db.initialize_schema().map_err(ApiError::from)?;
    
    // Store database in app state
    let mut db_mutex = state.db.lock().unwrap();
    *db_mutex = Some(db);
    
    Ok(true)
}

#[tauri::command]
pub async fn check_database_health(state: State<'_, AppState>) -> CommandResult<bool> {
    let db_mutex = state.db.lock().unwrap();
    match db_mutex.as_ref() {
        Some(db) => {
            // Simple health check - count company settings
            let _count = db.count_records("company_settings").map_err(ApiError::from)?;
            Ok(true)
        }
        None => Ok(false),
    }
}

// =====================================================
// Company Settings Commands
// =====================================================

#[tauri::command]
pub async fn get_company_settings(state: State<'_, AppState>) -> CommandResult<Option<CompanySettings>> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let settings = db.get_company_settings().map_err(ApiError::from)?;
    Ok(settings)
}

#[tauri::command]
pub async fn save_company_settings(
    settings: CompanySettings,
    state: State<'_, AppState>,
) -> CommandResult<i64> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let id = db.save_company_settings(&settings).map_err(ApiError::from)?;
    Ok(id)
}

// =====================================================
// Customer Management Commands
// =====================================================

#[tauri::command]
pub async fn get_customers(
    limit: Option<i32>,
    offset: Option<i32>,
    state: State<'_, AppState>,
) -> CommandResult<Vec<Customer>> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let customers = db.get_customers(limit, offset).map_err(ApiError::from)?;
    Ok(customers)
}

#[tauri::command]
pub async fn get_customer_by_id(
    id: i64,
    state: State<'_, AppState>,
) -> CommandResult<Option<Customer>> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let customer = db.get_customer_by_id(id).map_err(ApiError::from)?;
    Ok(customer)
}

#[tauri::command]
pub async fn save_customer(
    customer: Customer,
    state: State<'_, AppState>,
) -> CommandResult<i64> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let id = db.save_customer(&customer).map_err(ApiError::from)?;
    Ok(id)
}

#[tauri::command]
pub async fn delete_customer(
    id: i64,
    state: State<'_, AppState>,
) -> CommandResult<bool> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let deleted = db.delete_customer(id).map_err(ApiError::from)?;
    Ok(deleted)
}

#[tauri::command]
pub async fn search_customers(
    query: String,
    state: State<'_, AppState>,
) -> CommandResult<Vec<Customer>> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let customers = db.search_customers(&query).map_err(ApiError::from)?;
    Ok(customers)
}

// =====================================================
// Product Management Commands
// =====================================================

#[tauri::command]
pub async fn get_products(
    limit: Option<i32>,
    offset: Option<i32>,
    state: State<'_, AppState>,
) -> CommandResult<Vec<Product>> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let products = db.get_products(limit, offset).map_err(ApiError::from)?;
    Ok(products)
}

#[tauri::command]
pub async fn get_product_by_id(
    id: i64,
    state: State<'_, AppState>,
) -> CommandResult<Option<Product>> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let product = db.get_product_by_id(id).map_err(ApiError::from)?;
    Ok(product)
}

#[tauri::command]
pub async fn save_product(
    product: Product,
    state: State<'_, AppState>,
) -> CommandResult<i64> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let id = db.save_product(&product).map_err(ApiError::from)?;
    Ok(id)
}

#[tauri::command]
pub async fn delete_product(
    id: i64,
    state: State<'_, AppState>,
) -> CommandResult<bool> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let deleted = db.delete_product(id).map_err(ApiError::from)?;
    Ok(deleted)
}

#[tauri::command]
pub async fn search_products(
    query: String,
    state: State<'_, AppState>,
) -> CommandResult<Vec<Product>> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let products = db.search_products(&query).map_err(ApiError::from)?;
    Ok(products)
}

// =====================================================
// Indian States Commands
// =====================================================

#[tauri::command]
pub async fn get_indian_states(state: State<'_, AppState>) -> CommandResult<Vec<IndianState>> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let states = db.get_indian_states().map_err(ApiError::from)?;
    Ok(states)
}

#[tauri::command]
pub async fn get_state_by_code(
    state_code: String,
    state: State<'_, AppState>,
) -> CommandResult<Option<IndianState>> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let state_info = db.get_state_by_code(&state_code).map_err(ApiError::from)?;
    Ok(state_info)
}

// =====================================================
// Utility Commands
// =====================================================

#[tauri::command]
pub async fn get_record_counts(state: State<'_, AppState>) -> CommandResult<serde_json::Value> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let customers_count = db.count_records("customers").map_err(ApiError::from)?;
    let products_count = db.count_records("products").map_err(ApiError::from)?;
    let invoices_count = db.count_records("invoices").map_err(ApiError::from)?;
    
    Ok(serde_json::json!({
        "customers": customers_count,
        "products": products_count,
        "invoices": invoices_count
    }))
}

#[tauri::command]
pub async fn get_next_invoice_number(
    format: Option<String>,
    state: State<'_, AppState>,
) -> CommandResult<String> {
    let db_mutex = state.db.lock().unwrap();
    let db = db_mutex.as_ref().ok_or_else(|| ApiError {
        error: "DatabaseNotInitialized".to_string(),
        message: "Database not initialized".to_string(),
    })?;
    
    let format_str = format.as_deref().unwrap_or("INV-{YYYY}-{MM}-{####}");
    let next_number = db.get_next_invoice_number(format_str).map_err(ApiError::from)?;
    Ok(next_number)
}

// =====================================================
// GST Validation Commands (calling TypeScript functions)
// =====================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct GstinValidationResult {
    pub is_valid: bool,
    pub state_code: Option<String>,
    pub pan_number: Option<String>,
    pub entity_number: Option<String>,
    pub check_digit: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HsnSacValidationResult {
    pub is_valid: bool,
    pub validation_type: Option<String>, // "HSN" or "SAC"
    pub description: Option<String>,
    pub suggested_gst_rate: Option<f64>,
    pub error: Option<String>,
}

// Note: These validation functions would typically call the TypeScript GST calculator
// For now, we'll implement basic validation in Rust

#[tauri::command]
pub async fn validate_gstin(gstin: String) -> CommandResult<GstinValidationResult> {
    // Basic GSTIN validation (15 characters, proper format)
    if gstin.len() != 15 {
        return Ok(GstinValidationResult {
            is_valid: false,
            state_code: None,
            pan_number: None,
            entity_number: None,
            check_digit: None,
            error: Some("GSTIN must be exactly 15 characters".to_string()),
        });
    }
    
    let gstin_upper = gstin.to_uppercase();
    
    // Extract components
    let state_code = &gstin_upper[0..2];
    let pan_number = &gstin_upper[2..12];
    let entity_number = &gstin_upper[12..13];
    let check_digit = &gstin_upper[13..15];
    
    // Basic format validation
    if !state_code.chars().all(|c| c.is_ascii_digit()) {
        return Ok(GstinValidationResult {
            is_valid: false,
            state_code: None,
            pan_number: None,
            entity_number: None,
            check_digit: None,
            error: Some("Invalid state code format".to_string()),
        });
    }
    
    Ok(GstinValidationResult {
        is_valid: true,
        state_code: Some(state_code.to_string()),
        pan_number: Some(pan_number.to_string()),
        entity_number: Some(entity_number.to_string()),
        check_digit: Some(check_digit.to_string()),
        error: None,
    })
}

#[tauri::command]
pub async fn validate_hsn_sac(code: String) -> CommandResult<HsnSacValidationResult> {
    if code.is_empty() {
        return Ok(HsnSacValidationResult {
            is_valid: false,
            validation_type: None,
            description: None,
            suggested_gst_rate: None,
            error: Some("HSN/SAC code is required".to_string()),
        });
    }
    
    let clean_code = code.trim();
    
    // Check if it's a SAC code (services - starts with 99)
    if clean_code.starts_with("99") && clean_code.len() == 6 && clean_code.chars().all(|c| c.is_ascii_digit()) {
        return Ok(HsnSacValidationResult {
            is_valid: true,
            validation_type: Some("SAC".to_string()),
            description: Some("SAC code for services".to_string()),
            suggested_gst_rate: Some(18.0), // Default service rate
            error: None,
        });
    }
    
    // Check if it's an HSN code (goods - 2-8 digits)
    if clean_code.len() >= 2 && clean_code.len() <= 8 && clean_code.chars().all(|c| c.is_ascii_digit()) {
        return Ok(HsnSacValidationResult {
            is_valid: true,
            validation_type: Some("HSN".to_string()),
            description: Some("HSN code for goods".to_string()),
            suggested_gst_rate: Some(18.0), // Default goods rate
            error: None,
        });
    }
    
    Ok(HsnSacValidationResult {
        is_valid: false,
        validation_type: None,
        description: None,
        suggested_gst_rate: None,
        error: Some("Invalid HSN/SAC format".to_string()),
    })
} 