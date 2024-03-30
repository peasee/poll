use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Hash, Eq, PartialEq, Clone)]
pub struct Voter {
    pub ip: String,
    pub poll_id: String,
    pub option_id: String,
}

impl Voter {
    pub fn new(ip: String, poll_id: String, option_id: String) -> Self {
        Voter {
            ip,
            poll_id,
            option_id,
        }
    }
}
