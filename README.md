# poll
An open source, high performance, polling platform

# Usage

A publically available instance of the polling software is available at https://poll.nullabyte.com for anyone to use, free of charge, free of ads, free of tracking (only using ReCaptcha).

# Architecture

This configuration assumes you're running your poller service behind CloudFlare, and relies on both the CloudFlare supplied headers for originating IP and HTTP->HTTPS redirection on the CloudFlare layer.

It's also helpful for setting up NGINX on your application server, where you can just upload the CloudFlare supplied SSL certificate for use in NGINX instead of troubling with LetsEncrypt.

The Poller service is backed by a Redis database, running an Express application served with NGINX. This can all be on the same machine, or can be scaled out across many machines for improved load capacity. For example, you could setup a redis cluster across multiple separate machines, with multiple application servers load balanced by a dedicated NGINX server.

Some other considerations for performance have been made with this implementation like:
- Adding rate limiting to poll data GET methods, throttling requests to reasonable timeframes.
- Adding a thin GET method to return only the count of votes per method, suitable for when a client already has the poll data and just needs a vote count update. This reduces the network bandwidth used in sending a response.
- Using in-memory caches with short TTLs for poll data, to reduce Redis database hits and lower CPU usage while still providing reasonable timeliness.
- Not performing sanity checks for an option ID when a client is voting. The only time an option would be voted for that doesn't exist is by an attacker using an automated method. End users will never see these "phantom" votes, so there's little use in wasting CPU cycles sanity checking them.
- Utilising a random wait in the React client when performing web requests, in an attempt to balance peaky loads from the client side. The client performs a random wait between 100-1500ms before performing the web request, on each web request.

# But why not AWS?

"Oh, you want scaling performance? Why didn't you just make this in AWS?"

I'm not rich. That's all. Making this kind of application scale using something like DynamoDB/SQS/Lambda/API Gateway at a high load rate of 15 million votes per month (about 100 polls per day with 5000 votes) has a comparative cost of about $200 USD per month. Sure, it'll scale to essentially infinity loads, but this is only an averaged rate of about 350 requests / second, maybe peaking at the creation of polls around 1-2k requests / second. A $40 USD per month VPS will give you 3-4x this capacity, at a fifth of the cost.

# Installation

Installing the poller service is simple. Requirements are:
- A Redis server
- NodeJS 14 LTS or higher
- An NGINX server
- Python 3.9.6 or higher (for the generation of the NGINX configuration file)

This installation guide assumes all of these things are installed on the same machine, and that you're using a Debian-based operating system.
This guide also assumes that you've already configured CloudFlare with your domain to point to this machine, and that your CloudFlare private key and cert exist on the machine already.

Clone this repo into your destination server, then install the required packages.

    npm install

Edit the configuration file `config.json`, changing your preferred local port and the number of worker threads (this should equal the total cores on the machine).

Next, produce your NGINX configuration file using the provided Python script like `py generate_nginx_config.py --domain example.com`.
View all supported arguments with `py generate_nginx_config.py --help`.
If you do not supply a path to your SSL private key or certificate, the script assumes a path like `/etc/nginx/keys/domain.com.key` and `/etc/nginx/keys/domain.com.cert` respectively.

The total worker connections in NGINX are set to 10000 per worker. This requires modification of the ulimit to at least a value of 10000 to ensure smooth operation - the default on most Linux installation is well below this value. If you don't know how to do this, a quick Google will help you out.

Copy the generated `nginx.conf` into and replace the existing configuration in `/etc/nginx/nginx.conf`. Restart NGINX with `service nginx restart`.
Now, you can start your application server with `npm start` inside repo directory you cloned earlier. Do a Ctrl+C to exit the server.

If you want to setup a systemd service for your application server, edit the included service file and modify `ExecStart` to point to your installed directory. Also edit the `start.sh` file and modify the directory with your installed directory. Copy the included service file `poller.service` into `/etc/systemd/system` and run `sudo systemctl daemon-reload`. Now you can start and manage your poller service through systemd, including enabling it to run at startup with `systemctl enable poller`. Finally, start your new service with `systemctl start poller`.

Your new polling service should now be running!

# Config Format

The config file needs to be formatted like the following example:

```
{
    "threads": 2,
    "port": 8081,
    "host": "e.g. localhost",
    "recapSecretKey": "your recaptcha secret key",
    "recapSiteKey": "your recaptcha site key"
}
```

# Donating

Donations are always appreciated to support the running of the publically available instance, but are not required!

Donations are only supported in the following cryptocurrencies:


| Currency | Address |
| - | - |
| ETH | 0x19005D14F8f0E69A9F3A474bB892B6C5844C1A63 |
| XMR | 42cACZ56C9dcd58Jd7winAQ1PJcoypSgsdhGcfgD2ZBiTL5kpWWv7YT2UoNjjxmor9TnRuQRx9jXmev7dmFqawtSNsncwSs |
| RVN | RWGyhvVCYq7f7ZCersewpa8SAxEeFEKwRH |
| ADA | 0x19005D14F8f0E69A9F3A474bB892B6C5844C1A63 |