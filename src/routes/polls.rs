use std::{
    collections::HashMap,
    sync::{Arc, RwLock},
};

use axum::extract::State;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::models::{AppState, Voter};

use axum::{extract::Path, http::StatusCode, Json};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PollView {
    pub title: String,
    #[serde(rename = "optionCount")]
    pub option_count: u32,
    #[serde(flatten)]
    pub options: HashMap<String, String>,
}

/// GET /poll/:id
/// Returns a poll with the given id
pub async fn get_poll(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> (StatusCode, Json<Value>) {
    let guard = state.read();

    if guard.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to read state" })),
        );
    }

    let guard = guard.unwrap();

    match guard.polls.get(&id) {
        Some(poll) => {
            let mut view = PollView {
                title: poll.title.clone(),
                option_count: poll.options.len() as u32,
                options: HashMap::new(),
            };

            for (i, option) in poll.options.iter().enumerate() {
                view.options.insert(
                    format!("{:#?}:count", i + 1),
                    option.votes.len().to_string(),
                );
                view.options
                    .insert(format!("{:#?}:prompt", i + 1), option.title.clone());
            }

            (StatusCode::OK, Json(json!(view)))
        }
        None => (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Poll not found" })),
        ),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PollPartialView {
    #[serde(flatten)]
    pub options: HashMap<String, String>,
}

/// GET /poll/:id/options
/// Returns a poll with the given id
pub async fn get_poll_options(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> (StatusCode, Json<Value>) {
    let guard = state.read();

    if guard.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to read state" })),
        );
    }

    let guard = guard.unwrap();

    match guard.polls.get(&id) {
        Some(poll) => {
            let mut view = PollPartialView {
                options: HashMap::new(),
            };

            for (i, option) in poll.options.iter().enumerate() {
                view.options
                    .insert(format!("{:#?}", i + 1), option.votes.len().to_string());
            }

            (StatusCode::OK, Json(json!(view)))
        }
        None => (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Poll not found" })),
        ),
    }
}

/// POST /poll
/// Create a new poll
pub async fn create_poll(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(body): Json<serde_json::Value>,
) -> (StatusCode, Json<Value>) {
    let guard = state.write();

    if guard.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to read state" })),
        );
    }

    let mut guard = guard.unwrap();

    let poll = body
        .as_object()
        .and_then(|body| {
            let title = body.get("title")?.as_str()?;
            let options = body.get("options")?.as_array()?;
            let options = options
                .iter()
                .map(|option| option.as_str().map(|s| s.to_string()));
            Some((title.to_string(), options.collect::<Option<Vec<_>>>()?))
        })
        .map(|(title, options)| {
            let mut poll = crate::models::Poll::new(title, None);

            for option in options {
                poll.add_option(crate::models::PollOption::new(option, None));
            }

            guard.polls.insert(poll.id.clone(), poll.clone());
            poll
        });

    match poll {
        Some(poll) => (StatusCode::CREATED, Json(json!({"id": poll.id}))),
        None => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Invalid poll" })),
        ),
    }
}

/// POST /poll/:id/vote
/// Vote on a poll
pub async fn vote_poll(
    Path(_id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(_body): Json<serde_json::Value>,
) -> (StatusCode, Json<Value>) {
    let guard = state.write();

    if guard.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to read state" })),
        );
    }

    let _guard = guard.unwrap();

    let vote: Option<Voter> = None;

    match vote {
        Some(_vote) => (StatusCode::CREATED, Json(json!({"done": "yes"}))),
        None => (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Invalid poll" })),
        ),
    }
}
