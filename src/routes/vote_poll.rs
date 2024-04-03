use std::sync::{Arc, RwLock};

use axum::{extract::State, response::Result};

use serde_json::{json, Value};

use crate::models::{APIError, APILock, AppState, PollVoteBody, Voter};

use axum::{extract::Path, http::StatusCode, Json};

/// POST /poll/:id/vote
/// Vote on a poll
pub async fn vote_poll(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(body): Json<serde_json::Value>,
) -> Result<(StatusCode, Json<Value>)> {
    let mut guard = state.write_lock()?;

    let body = PollVoteBody::try_from(body)?;
    match guard.polls.get_mut(&id) {
        Some(poll) => {
            // the option is the array index of the target option + 1
            let option = poll
                .options
                .get_mut((body.option - 1) as usize)
                .ok_or(APIError::OptionNotFound)?;

            let voter = Voter::new("localhost".to_string(), id.clone(), body.option);
            let voted = option.vote(&voter);

            Ok((StatusCode::OK, Json(json!({"voted": voted}))))
        }
        None => Err(APIError::PollNotFound.into()),
    }
}
