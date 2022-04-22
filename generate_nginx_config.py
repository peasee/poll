import argparse
import json

site_config = """
user www-data;
worker_processes {0};
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {{
        worker_connections 10000;
}}

http {{
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    ssl_session_timeout  1d;
    ssl_session_cache    shared:SSL:10m;
    ssl_session_tickets  off;
    ssl_dhparam          /etc/nginx/dhparam.pem;
    ssl_protocols        TLSv1.2 TLSv1.3;
    ssl_ciphers          ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_stapling         on;
    ssl_stapling_verify  on;
    resolver             1.1.1.1 1.0.0.1 8.8.8.8 8.8.4.4 208.67.222.222 208.67.220.220 valid=60s;
    resolver_timeout     2s;
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    gzip on;

    limit_req_zone $binary_remote_addr zone=pollBaseRoute:10m rate=12r/m;
    limit_req_zone $binary_remote_addr zone=pollPartialData:10m rate=20r/m;
    limit_req_zone $binary_remote_addr zone=pollVote:10m rate=10r/m;

    server {{
        listen 443 ssl http2;
        server_name {1};

        ssl_certificate {2};
        ssl_certificate_key {3};

        add_header Strict-Transport-Security "max-age=15552000; includeSubDomains" always;

        location ^~ /api/poll/\w*/vote$ {{
            limit_req zone=pollVote;

            client_max_body_size 1M;
            proxy_pass http://127.0.0.1:{4};
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Host $http_host;
            proxy_set_header X-Forwarded-Host $http_host;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_max_temp_file_size 0;
            proxy_redirect off;
            proxy_read_timeout 120;
        }}

        location ^~ /api/poll/\w*/options$ {{
            limit_req zone=pollPartialData;

            client_max_body_size 1M;
            proxy_pass http://127.0.0.1:{4};
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Host $http_host;
            proxy_set_header X-Forwarded-Host $http_host;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_max_temp_file_size 0;
            proxy_redirect off;
            proxy_read_timeout 120;
        }}

        location ^~ /api/poll/\w*$ {{
            limit_req zone=pollBaseRoute;

            client_max_body_size 1M;
            proxy_pass http://127.0.0.1:{4};
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Host $http_host;
            proxy_set_header X-Forwarded-Host $http_host;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_max_temp_file_size 0;
            proxy_redirect off;
            proxy_read_timeout 120;
        }}

        location /static {{
            root /opt/poller/public;
        }}
    }}
}}
"""

parser = argparse.ArgumentParser(description="Generate your Nginx configuration for your poller")
parser.add_argument("--domain", required=True, help="The hosted domain for your poller")
parser.add_argument("--private_key", help="The private key file location for SSL")
parser.add_argument("--cert", help="The certificate file location for SSL")
parser.add_argument("--port", help="The local port to proxy for the poller service")
parser.add_argument("--directory", help="Your installed application directory")

args = parser.parse_args()
with open("./config.json") as config_file:
    config = json.loads(config_file.read())

if args.port is None:
    args.port = config["port"]

if args.directory is None:
    args.directory = "/opt/poller"

if args.private_key is None:
    args.private_key = "/etc/nginx/keys/{}.key".format(args.domain)

if args.cert is None:
    args.cert = "/etc/nginx/keys/{}.cert".format(args.domain)

site_config = site_config.format(config["threads"], args.domain, args.cert, args.private_key, args.port)
with open("./nginx.conf", "w") as output_config:
    output_config.write(site_config)