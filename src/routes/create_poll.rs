use std::sync::Arc;

use axum::{extract::State, response::Result};

use serde_json::{json, Value};
use tokio::sync::Mutex;

use crate::{
    functions::recaptcha::Recaptcha,
    models::{AppState, NewPollBody, Poll},
};


use axum::{http::StatusCode, Json};

/// POST /poll
/// Create a new poll
pub async fn create_poll(
    State(state): State<Arc<Mutex<AppState>>>,
    Json(body): Json<serde_json::Value>, // it sucks that we can't just do: Json<NewPollBody>,
                                         // because for API servers, we can't control the error response in axum when the deserialize fails
                                         // see more: https://github.com/tokio-rs/axum/issues/1116
) -> Result<(StatusCode, Json<Value>)> {
    let mut guard = state.lock().await;

    let body = NewPollBody::try_from(body)?; // instead, we have a TryFrom implementation which throws an APIError
                                             // here, we can control our response when the deserialization fails

    if body.recaptcha_token.is_some() {
        body.verify(&guard.config).await?;
    }

    let poll = Poll::from(body);
    guard.polls.insert(poll.id.clone(), poll.clone());

    Ok((StatusCode::CREATED, Json(json!({"id": poll.id}))))
}
