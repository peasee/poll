use std::sync::{Arc, RwLock, RwLockReadGuard, RwLockWriteGuard};

use axum::response::{IntoResponse, Response, Result};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use axum::{http::StatusCode, Json};
use std::collections::BTreeMap;

use super::{Poll, PollOption};

pub struct AppState {
    pub polls: BTreeMap<String, Poll>,
}

pub enum APIError {
    PollNotFound,
    OptionNotFound,
    InvalidRequest,
    StateError,
}

impl IntoResponse for APIError {
    fn into_response(self) -> Response {
        match self {
            APIError::PollNotFound => (
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Poll not found" })),
            )
                .into_response(),
            APIError::InvalidRequest => (
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": "Invalid request" })),
            )
                .into_response(),
            APIError::StateError => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Failed to read state" })),
            )
                .into_response(),
            APIError::OptionNotFound => (
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Option not found" })),
            )
                .into_response(),
        }
    }
}

pub trait APILock {
    fn read_lock(&self) -> Result<RwLockReadGuard<AppState>, APIError>;
    fn write_lock(&self) -> Result<RwLockWriteGuard<AppState>, APIError>;
}

impl APILock for Arc<RwLock<AppState>> {
    fn read_lock(&self) -> Result<RwLockReadGuard<AppState>, APIError> {
        self.read().map_err(|_| APIError::StateError)
    }

    fn write_lock(&self) -> Result<RwLockWriteGuard<AppState>, APIError> {
        self.write().map_err(|_| APIError::StateError)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewPollBody {
    pub title: String,
    pub description: Option<String>,
    pub options: Vec<String>,
}

impl TryFrom<serde_json::Value> for NewPollBody {
    type Error = APIError;

    fn try_from(value: Value) -> Result<Self, Self::Error> {
        let title = value
            .get("title")
            .and_then(Value::as_str)
            .ok_or(APIError::InvalidRequest)?;

        let options = value
            .get("options")
            .and_then(Value::as_array)
            .map(|options| {
                options
                    .iter()
                    .filter_map(Value::as_str)
                    .map(String::from)
                    .collect()
            })
            .ok_or(APIError::InvalidRequest)?;

        Ok(NewPollBody {
            title: title.to_string(),
            description: None,
            options,
        })
    }
}

impl From<NewPollBody> for Poll {
    fn from(body: NewPollBody) -> Self {
        let mut poll = Poll::new(body.title, body.description);

        for option in body.options {
            poll.add_option(PollOption::new(option, None));
        }

        poll
    }
}

pub struct PollVoteBody {
    pub option: u64,
}

impl TryFrom<serde_json::Value> for PollVoteBody {
    type Error = APIError;

    fn try_from(value: Value) -> Result<Self, Self::Error> {
        let option = value
            .get("option")
            .and_then(Value::as_u64)
            .map(u64::from)
            .ok_or(APIError::InvalidRequest)?;

        Ok(PollVoteBody { option })
    }
}
