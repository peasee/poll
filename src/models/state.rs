use std::collections::BTreeMap;

use super::Poll;

pub struct AppState {
    pub polls: BTreeMap<String, Poll>,
}
