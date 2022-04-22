#!/bin/bash

echo "*                soft    nofile          10000" >>/etc/security/limits.conf
echo "*                hard    nofile          40000" >>/etc/security/limits.conf

rm -rf /opt/poller

apt update
apt install python3 wget curl build-essential make gcc libreadline-gplv2-dev libncursesw5-dev -y

curl -fsSL https://deb.nodesource.com/setup_17.x | bash -
apt-get install nodejs -y

curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list
apt update
apt install redis -y

apt install nginx -y

cd /opt
git clone https://github.com/peasee/poll
cp -rf ./poll ./poller
rm -rf ./poll

cd /opt/poller
npm install

cat >/opt/poller/config.json <<EOF
{
    "threads": 2,
    "port": 8081,
    "host": "$1",
    "recapSecretKey": "recap secret",
    "recapSiteKey": "recap site"
}
EOF

python3 generate_nginx_config.py --domain=$1

cp ./nginx.conf /etc/nginx/nginx.conf
cp ./poller.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable poller
systemctl start poller

service nginx restart