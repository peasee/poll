# poll
An open source, high performance, polling platform

# Table of Contents
1. [V2 Backend](#backend)
    - [Why not AWS?](#aws)
2. [Getting Started](#getting-started)
    - [Config format](#config)

# V2 Backend<a name="backend"></a>

I've recently gone on an adventure to update the backend of this polling service to be a Rust backend, using `axum` as a web server.
The service now also uses a Docker Compose file to make it easy to spin up your own instance of this service.

Why did I migrate to Rust as a backend?

1. It's much, _much_ faster than NodeJS. Using `autocannon` with 8 worker threads on a 32-core 2x Intel Xeon E5-2450 v2 CPUs achieved around 140,000 requests per second. A single worker thread achieved 18,000 requests per second. Granted, this includes the removal of writes/reads to redis, but impressive nonetheless.
2. Rust is now one of my primary languages, although I've never used it as a web server. I thought it would be a fun exercise to try updating the backend.
3. All benefits (and cons) of the entire Rust language - type and memory safety, traits, etc.

I also removed redis as a requirement, and replaced it with a simple in-memory `BTreeMap` because chances are you don't care about the results of your poll for any longer than 30 minutes and if the server restarts while you're running your poll you'll probably just remake the poll.
Removing redis also helped drastically increase the requests per second throughput.

## But why not AWS?<a name="aws"></a>

"Oh, you want scaling performance to the moon? Why didn't you just make this in AWS?"

I'm not rich. That's all. Making this kind of application scale using something like DynamoDB/SQS/Lambda/API Gateway at a high load rate of 15 million votes per month (about 100 polls per day with 5000 votes) has a comparative cost of about $200 USD per month.

Sure, it'll scale to essentially infinity loads, but this is only an averaged rate of about 350 requests / second, maybe peaking at the creation of polls around 1-2k requests / second.

A $15 USD per month VPS will give you 10-20x this capacity, at a fraction of the cost.

# Getting Started<a name="getting_started"></a>

TODO

## Config Format<a name="config"></a>

The config file needs to be formatted like the following example:

```
{
    "threads": 2,
    "port": 8081,
    "host": "e.g. localhost",
    "clientAPI": "full web URI path for the public API, e.g. https://domain.com",
    "recapSecretKey": "your recaptcha secret key",
    "recapSiteKey": "your recaptcha site key"
}
```
