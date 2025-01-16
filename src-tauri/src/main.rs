// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

fn main() {
    let migrations = vec![
        Migration{
            version: 1,
            description: "create_category_table",
            sql: "CREATE TABLE categories (
                id TEXT PRIMARY KEY,
                category TEXT UNIQUE NOT NULL,
                priority INTEGER UNIQUE NOT NULL
            )",
            kind: MigrationKind::Up,
        },
        Migration{
            version: 2,
            description: "create_subcategory_table",
            sql: "CREATE TABLE subcategories (
                id TEXT PRIMARY KEY,
                categoryid TEXT NOT NULL,
                subcategory TEXT UNIQUE NOT NULL,
                priority INTEGER NOT NULL,
                FOREIGN KEY (categoryid) REFERENCES categories(id) ON DELETE CASCADE
            )",
            kind: MigrationKind::Up,
        },
        Migration{
            version: 3,
            description: "create_items_table",
            sql: "CREATE TABLE items (
                id TEXT PRIMARY KEY,
                subcategoryid TEXT NOT NULL,
                priority INTEGER NOT NULL,
                number TEXT,
                description TEXT,
                price REAL,
                FOREIGN KEY (subcategoryid) REFERENCES subcategories(id) ON DELETE CASCADE
            )",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:main.db", migrations)
            .build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}
