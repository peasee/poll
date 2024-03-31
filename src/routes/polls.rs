use std::sync::{Arc, RwLock};

use axum::{extract::State, response::Result};

use serde_json::{json, Value};

use crate::models::{
    APIError, APILock, AppState, NewPollBody, Poll, PollPartialView, PollView, PollVoteBody, Voter,
};

use axum::{extract::Path, http::StatusCode, Json};

/// GET /poll/:id
/// Returns a poll with the given id
pub async fn get_poll(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> Result<(StatusCode, Json<Value>)> {
    let guard = state.read_lock()?;

    match guard.polls.get(&id) {
        Some(poll) => {
            let view = PollView::from(poll);

            Ok((StatusCode::OK, Json(json!(view))))
        }
        None => Err(APIError::PollNotFound.into()),
    }
}

/// GET /poll/:id/options
/// Returns a poll with the given id
pub async fn get_poll_options(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> Result<(StatusCode, Json<Value>)> {
    let guard = state.read_lock()?;

    match guard.polls.get(&id) {
        Some(poll) => {
            let view = PollPartialView::from(poll);

            Ok((StatusCode::OK, Json(json!(view))))
        }
        None => Err(APIError::PollNotFound.into()),
    }
}

/// POST /poll
/// Create a new poll
pub async fn create_poll(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(body): Json<serde_json::Value>, // it sucks that we can't just do: Json<NewPollBody>,
                                         // because for API servers, we can't control the error response in axum when the deserialize fails
                                         // see more: https://github.com/tokio-rs/axum/issues/1116
) -> Result<(StatusCode, Json<Value>)> {
    let mut guard = state.write_lock()?;

    let body = NewPollBody::try_from(body)?; // instead, we have a TryFrom implementation which throws an APIError
                                             // here, we can control our response when the deserialization fails

    let poll = Poll::from(body);
    guard.polls.insert(poll.id.clone(), poll.clone());

    Ok((StatusCode::CREATED, Json(json!({"id": poll.id}))))
}

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
