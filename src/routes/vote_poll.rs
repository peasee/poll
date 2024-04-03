use std::sync::Arc;

use axum::{extract::State, http::HeaderMap, response::Result};

use serde_json::{json, Value};
use tokio::sync::Mutex;

use crate::{
    functions::recaptcha::Recaptcha,
    models::{APIError, AppState, PollVoteBody, Voter},
};

use axum::{extract::Path, http::StatusCode, Json};

use axum::extract::ConnectInfo;
use std::net::SocketAddr;

/// POST /poll/:id/vote
/// Vote on a poll
pub async fn vote_poll(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Path(id): Path<String>,
    State(state): State<Arc<Mutex<AppState>>>,
    Json(body): Json<serde_json::Value>,
) -> Result<(StatusCode, Json<Value>)> {
    let mut guard = state.lock().await;

    let body = PollVoteBody::try_from(body)?;
    if body.recaptcha_token.is_some() {
        body.verify(&guard.config).await?;
    }

    match guard.polls.get_mut(&id) {
        Some(poll) => {
            // the option is the array index of the target option + 1
            let option = poll
                .options
                .get_mut((body.option - 1) as usize)
                .ok_or(APIError::OptionNotFound)?;

            let ip = if let Some(ip) = headers.get("X-Forwarded-For") {
                ip.to_str().unwrap_or(&addr.to_string()).to_string()
            } else {
                addr.to_string()
            };

            tracing::info!(ip, "Voting on poll");
            let voter = Voter::new(ip, id.clone(), body.option);
            let voted = option.vote(&voter);

            Ok((StatusCode::OK, Json(json!({"voted": voted}))))
        }
        None => Err(APIError::PollNotFound.into()),
    }
}
