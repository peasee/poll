use std::sync::{Arc, RwLock};

use axum::{extract::State, response::Result};
use serde_json::{json, Value};

use crate::models::AppState;

use axum::{
    extract::Path,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};

// Simple route with no params
pub async fn alive() -> (StatusCode, Json<Value>) {
    (StatusCode::OK, Json(json!({ "hello": "world" })))
}

// Simple route with params in the route path
pub async fn alive_with_name(Path(name): Path<String>) -> (StatusCode, Json<Value>) {
    (StatusCode::OK, Json(json!({ "hello": name })))
}

// This example route pulls the state from the app
pub async fn alive_with_state(
    State(state): State<Arc<RwLock<AppState>>>,
) -> (StatusCode, Json<Value>) {
    let state = state.read();

    if state.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to read state" })),
        );
    }

    let state = state.unwrap();

    (StatusCode::OK, Json(json!({ "polls": state.polls.len() })))
}

// This is a more complex example of a route that uses a result
// When the result fails, it automatically responds with the error
enum CustomError {
    AliveWithError,
}

impl IntoResponse for CustomError {
    fn into_response(self) -> Response {
        match self {
            CustomError::AliveWithError => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "An internal error occurred" })),
            )
                .into_response(),
        }
    }
}

pub async fn alive_with_error() -> Result<(StatusCode, Json<Value>)> {
    fn inner() -> Result<(StatusCode, Json<Value>), CustomError> {
        Err(CustomError::AliveWithError)
    }

    Ok(inner()?)
}
