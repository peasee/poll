use std::future::Future;

use crate::models::{APIError, AppConfiguration, NewPollBody, PollVoteBody};
use axum::response::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct RecaptchaResponse {
    success: bool,
    hostname: String,
    action: String,
    score: f32,
}

async fn verify_recaptcha(
    config: &AppConfiguration,
    recaptcha_token: &str,
    originating_route: &str,
) -> anyhow::Result<bool> {
    let secret_key = config.recaptcha_secret_key.clone().unwrap_or(String::new());
    let client = reqwest::Client::new();
    let res = client.post(format!("https://www.google.com/recaptcha/api/siteverify?secret={secret_key}&response={recaptcha_token}"))
        .send()
        .await?.json::<RecaptchaResponse>().await?;

    tracing::info!("{:#?}", res.hostname);

    let valid = res.success == true
        && res.hostname == config.host
        && res.action == originating_route
        && res.score >= 0.5;

    Ok(valid)
}

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
    ) -> impl Future<Output = Result<(), APIError>> + Send;
}

impl Recaptcha for PollVoteBody {
    async fn verify(&self, config: &AppConfiguration) -> Result<(), APIError> {
        // verify the recaptcha token
        // this is a stub implementation
        self.validate(config)?;

        let recaptcha_response = verify_recaptcha(
            config,
            self.recaptcha_token.as_ref().unwrap_or(&String::new()),
            "create",
        )
        .await;

        if recaptcha_response.is_err() {
            return Err(APIError::ConfigurationError);
        }

        if !recaptcha_response.unwrap() {
            return Err(APIError::InvalidToken);
        }

        Ok(())
    }
}

impl Recaptcha for NewPollBody {
    async fn verify(&self, config: &AppConfiguration) -> Result<(), APIError> {
        // verify the recaptcha token
        // this is a stub implementation
        self.validate(config)?;

        let recaptcha_response = verify_recaptcha(
            config,
            self.recaptcha_token.as_ref().unwrap_or(&String::new()),
            "vote",
        )
        .await;

        if recaptcha_response.is_err() {
            return Err(APIError::ConfigurationError);
        }

        if !recaptcha_response.unwrap() {
            return Err(APIError::InvalidToken);
        }

        Ok(())
    }
}
