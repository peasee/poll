use std::future::Future;

use crate::models::{APIError, AppConfiguration, NewPollBody, PollVoteBody};
use axum::response::Result;

pub trait Recaptcha {
    fn validate(&self, config: &AppConfiguration) -> Result<(), APIError> {
        if config.recaptcha_secret_key.is_none() || config.recaptcha_site_key.is_none() {
            return Err(APIError::ConfigurationError);
        }

        Ok(())
    }

    fn verify(
        &self,
        config: &AppConfiguration,
    ) -> impl Future<Output = Result<bool, APIError>> + Send;
}

impl Recaptcha for PollVoteBody {
    async fn verify(&self, config: &AppConfiguration) -> Result<bool, APIError> {
        // verify the recaptcha token
        // this is a stub implementation
        self.validate(config)?;

        Ok(true)
    }
}

impl Recaptcha for NewPollBody {
    async fn verify(&self, config: &AppConfiguration) -> Result<bool, APIError> {
        // verify the recaptcha token
        // this is a stub implementation
        self.validate(config)?;

        Ok(true)
    }
}
