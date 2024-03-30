use anyhow::Result;
use serde_json::{json, Value};
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

use axum::{extract::Path, http::StatusCode, routing::get, Json, Router};

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

    // build our application with a route
    let app = Router::new()
        .route("/alive", get(alive))
        .route("/alive/:name", get(alive_with_name));

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3081").await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn alive() -> (StatusCode, Json<Value>) {
    (StatusCode::OK, Json(json!({ "hello": "world" })))
}

async fn alive_with_name(Path(name): Path<String>) -> (StatusCode, Json<Value>) {
    (StatusCode::OK, Json(json!({ "hello": name })))
}
