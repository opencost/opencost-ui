#!/bin/sh
set -e

# Set document root based on LEGACY_MODE (run with -e LEGACY_MODE=true for legacy UI)
if [ "$LEGACY_MODE" = "true" ] || [ "$LEGACY_MODE" = "1" ] || [ "$LEGACY_MODE" = "yes" ]; then
    export NGINX_ROOT=/var/www/legacy
    WWW_ROOT=/var/www/legacy
    echo "Serving legacy UI from $WWW_ROOT"
else
    export NGINX_ROOT=/var/www
    WWW_ROOT=/var/www
    echo "Serving default UI from $WWW_ROOT"
fi

# Copy build output to /var/www if present (Dockerfile.cross flow)
if [ -d /opt/ui/dist ]; then
    cp -rv /opt/ui/dist/* "$WWW_ROOT"
fi

# Replace placeholders in all .js files (including assets/*.js)
if [ -n "$BASE_URL_OVERRIDE" ]; then
    echo "running with BASE_URL=${BASE_URL_OVERRIDE}"
    find "$WWW_ROOT" -name "*.js" -exec sed -i "s^{PLACEHOLDER_BASE_URL}^$BASE_URL_OVERRIDE^g" {} \; 2>/dev/null || true
else
    echo "running with BASE_URL=${BASE_URL}"
    find "$WWW_ROOT" -name "*.js" -exec sed -i "s^{PLACEHOLDER_BASE_URL}^$BASE_URL^g" {} \; 2>/dev/null || true
fi

if [ -n "$OPENCOST_FOOTER_CONTENT" ]; then
    find "$WWW_ROOT" -name "*.js" -exec sed -i "s^PLACEHOLDER_FOOTER_CONTENT^$OPENCOST_FOOTER_CONTENT^g" {} \; 2>/dev/null || true
else
    find "$WWW_ROOT" -name "*.js" -exec sed -i "s^PLACEHOLDER_FOOTER_CONTENT^OpenCost version: $VERSION ($HEAD)^g" {} \; 2>/dev/null || true
fi

# Custom aggregation options: JSON object (map string:string), e.g. {"Label: team":"label:team"}
if [[ ! -z "$CUSTOM_AGGREGATION_OPTIONS" ]]; then
    echo "injecting CUSTOM_AGGREGATION_OPTIONS"
    esc=$(printf '%s' "$CUSTOM_AGGREGATION_OPTIONS" | sed 's/\\/\\\\/g; s/&/\\&/g; s/"/\\"/g')
    sed -i "s^PLACEHOLDER_CUSTOM_AGGREGATIONS^$esc^g" /var/www/*.js
else
    sed -i "s^PLACEHOLDER_FOOTER_CONTENT^OpenCost version: $VERSION ($HEAD)^g" /var/www/*.js
fi

if [ ! -e /etc/nginx/conf.d/default.nginx.conf ]; then
    envsubst '$API_PORT $API_SERVER $UI_PORT $NGINX_ROOT $UI_PATH $BASE_URL $PROXY_CONNECT_TIMEOUT $PROXY_SEND_TIMEOUT $PROXY_READ_TIMEOUT' \
        < /etc/nginx/conf.d/default.nginx.conf.template \
        > /etc/nginx/conf.d/default.nginx.conf
fi
echo "Starting OpenCost UI version $VERSION ($HEAD)"

# Run the parent (nginx) container's entrypoint script
exec /docker-entrypoint.sh "$@"
