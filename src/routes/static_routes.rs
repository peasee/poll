use std::sync::Arc;

use axum::{
    extract::State,
    response::{Html, Result},
};

use serde_json::{json, Value};
use tokio::sync::Mutex;

use crate::models::{APIError, AppState, PollView};

use axum::{extract::Path, http::StatusCode, Json};

/// GET /index.html
/// Returns a poll with the given id
pub async fn get_index() -> Result<(StatusCode, Html<String>)> {
    Ok((
        StatusCode::OK,
        Html(include_str!("../../public/index.html").to_string()),
    ))
}

/// GET /bundle.js
/// Returns a poll with the given id
pub async fn get_bundle() -> Result<(StatusCode, Html<String>)> {
    Ok((
        StatusCode::OK,
        Html(include_str!("../../public/bundle.js").to_string()),
    ))
}
