use axum::response::{Html, Result};

use axum::http::StatusCode;

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
