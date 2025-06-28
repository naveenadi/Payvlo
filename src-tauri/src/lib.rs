// Import our modules
mod database;
mod commands;

use commands::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(AppState::new())
    .invoke_handler(tauri::generate_handler![
      // Database initialization
      commands::initialize_database,
      commands::check_database_health,
      
      // Company settings
      commands::get_company_settings,
      commands::save_company_settings,
      
      // Customer management
      commands::get_customers,
      commands::get_customer_by_id,
      commands::save_customer,
      commands::delete_customer,
      commands::search_customers,
      
      // Product management
      commands::get_products,
      commands::get_product_by_id,
      commands::save_product,
      commands::delete_product,
      commands::search_products,
      
      // Indian states
      commands::get_indian_states,
      commands::get_state_by_code,
      
      // Utilities
      commands::get_record_counts,
      commands::get_next_invoice_number,
      
      // GST validation
      commands::validate_gstin,
      commands::validate_hsn_sac,
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
