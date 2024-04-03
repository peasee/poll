use std::sync::Arc;

use axum::{extract::State, response::Result};

use serde_json::{json, Value};
use tokio::sync::Mutex;

use crate::models::{APIError, AppState, PollPartialView};

use axum::{extract::Path, http::StatusCode, Json};

/// GET /poll/:id/options
/// Returns a poll with the given id
pub async fn get_poll_options(
    Path(id): Path<String>,
    State(state): State<Arc<Mutex<AppState>>>,
) -> Result<(StatusCode, Json<Value>)> {
    let guard = state.lock().await;

    match guard.polls.get(&id) {
        Some(poll) => {
            let view = PollPartialView::from(poll);

            Ok((StatusCode::OK, Json(json!(view))))
        }
        None => Err(APIError::PollNotFound.into()),
    }
}
