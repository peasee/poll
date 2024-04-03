use clap::Parser;

#[derive(Debug, Parser, Clone)]
#[command(version, about, long_about = None)]
pub struct AppConfiguration {
    #[arg(env, long)]
    pub recaptcha_secret_key: Option<String>,
    #[arg(env, long)]
    pub recaptcha_site_key: Option<String>,
    #[arg(env, long, default_value = "3081")]
    pub port: u32,
    #[arg(env, long, default_value = "0.0.0.0")]
    pub host: String,
    #[arg(env, long, default_value = "http://localhost:3081")]
    pub api_host: String,
}
