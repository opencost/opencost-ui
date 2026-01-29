#!/bin/sh
set -e

cp -rv /opt/ui/dist/* /var/www

echo "running with UI_PATH=${UI_PATH}"

if [[ ! -z "$BASE_URL_OVERRIDE" ]]; then
    echo "running with BASE_URL=${BASE_URL_OVERRIDE}"
    sed -i "s^{PLACEHOLDER_BASE_URL}^$BASE_URL_OVERRIDE^g" /var/www/*.js
else
    echo "running with BASE_URL=${BASE_URL}"
    sed -i "s^{PLACEHOLDER_BASE_URL}^$BASE_URL^g" /var/www/*.js
fi

# export your OPENCOST_FOOTER_CONTENT='<a href="https://opencost.io">OpenCost</a>' in your Dockerfile to set
if [[ ! -z "$OPENCOST_FOOTER_CONTENT" ]]; then
    sed -i "s^PLACEHOLDER_FOOTER_CONTENT^$OPENCOST_FOOTER_CONTENT^g" /var/www/*.js
else
    sed -i "s^PLACEHOLDER_FOOTER_CONTENT^OpenCost version: $VERSION ($HEAD)^g" /var/www/*.js
fi

if [[ ! -z "$DEFAULT_CURRENCY" ]]; then
    echo "running with DEFAULT_CURRENCY=${DEFAULT_CURRENCY}"
    sed -i "s^{PLACEHOLDER_DEFAULT_CURRENCY}^$DEFAULT_CURRENCY^g" /var/www/*.js
else
    echo "running with DEFAULT_CURRENCY=USD"
    sed -i "s^{PLACEHOLDER_DEFAULT_CURRENCY}^USD^g" /var/www/*.js
fi

if [[ ! -e /etc/nginx/conf.d/default.nginx.conf ]];then
    envsubst '$API_PORT $API_SERVER $UI_PORT $UI_PATH $BASE_URL $PROXY_CONNECT_TIMEOUT $PROXY_SEND_TIMEOUT $PROXY_READ_TIMEOUT' \
        < /etc/nginx/conf.d/default.nginx.conf.template \
        > /etc/nginx/conf.d/default.nginx.conf
fi
echo "Starting OpenCost UI version $VERSION ($HEAD)"

# Run the parent (nginx) container's entrypoint script
exec /docker-entrypoint.sh "$@"
