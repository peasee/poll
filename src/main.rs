use anyhow::Result;
use axum::routing::post;

use std::collections::BTreeMap;
use std::sync::{Arc, RwLock};
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

use axum::{routing::get, Router};

use poll::models::AppState;
use poll::routes::alive::{alive, alive_with_error, alive_with_name, alive_with_state};

#[tokio::main]
async fn main() -> Result<()> {
    let subscriber = FmtSubscriber::builder()
        // all spans/events with a level higher than TRACE (e.g, debug, info, warn, etc.)
        // will be written to stdout.
        .with_max_level(Level::TRACE)
        // completes the builder.
        .finish();

    tracing::subscriber::set_global_default(subscriber).expect("setting default subscriber failed");

    info!("Hello, world!");

    let shared_state = Arc::new(RwLock::new(AppState {
        polls: BTreeMap::new(),
    }));

    // build our application with a route
    let app = Router::new()
        .route("/alive", get(alive))
        .route("/alive/with_state", get(alive_with_state))
        .route("/alive/with_error", get(alive_with_error))
        .route("/alive/:name", get(alive_with_name))
        .route("/poll/:id", get(poll::routes::polls::get_poll))
        .route(
            "/poll/:id/options",
            get(poll::routes::polls::get_poll_options),
        )
        .route("/poll", post(poll::routes::polls::create_poll))
        .route("/poll/:id/vote", post(poll::routes::polls::vote_poll))
        .with_state(shared_state);

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3081").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
