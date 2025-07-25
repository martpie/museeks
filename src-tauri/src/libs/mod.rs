pub mod database;
pub mod error;
pub mod events;
pub mod init;
pub mod utils;

/**
 * Structs
 */
pub mod playlist;
pub mod track;

/**
 * Tests
 */
#[cfg(test)]
#[path = "./tests/database_tests.rs"]
mod database_tests;
