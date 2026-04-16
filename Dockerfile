FROM node:20-alpine AS builder
WORKDIR /opt/ui
ADD package*.json ./
RUN npm install
ADD . ./
# Save first build outside build/ so build:legacy (which overwrites build/) doesn't remove it
RUN npm run build && cp -r build/client /opt/standard
RUN npm run build:legacy
# Verify both builds produced output
RUN test -f /opt/standard/index.html && test -f /opt/ui/build/client/index.html && \
    test -d /opt/standard/assets && test -d /opt/ui/build/client/assets && \
    echo "Both builds OK" && ls -la /opt/standard/ && ls -la /opt/ui/build/client/

FROM nginx:alpine

RUN apk --no-cache upgrade

LABEL org.opencontainers.image.description="Cross-cloud cost allocation models for Kubernetes workloads"
LABEL org.opencontainers.image.documentation=https://opencost.io/docs/
LABEL org.opencontainers.image.licenses=Apache-2.0
LABEL org.opencontainers.image.source=https://github.com/opencost/opencost-ui
LABEL org.opencontainers.image.title=opencost-ui
LABEL org.opencontainers.image.url=https://opencost.io

ARG ui_path=/
ARG version=dev
ARG commit=HEAD
ENV VERSION=${version}
ENV HEAD=${commit}

ENV API_PORT=9003
ENV API_SERVER=0.0.0.0
ENV UI_PORT=9090
ENV UI_PATH=${ui_path}

RUN mkdir -p /var/www /var/www/legacy

COPY THIRD_PARTY_LICENSES.txt /THIRD_PARTY_LICENSES.txt
COPY --from=builder /opt/standard /var/www
COPY --from=builder /opt/ui/build/client /var/www/legacy

COPY default.nginx.conf.template /etc/nginx/conf.d/default.nginx.conf.template
COPY nginx.conf /etc/nginx/
COPY ./docker-entrypoint.sh /usr/local/bin/

RUN rm -rf /etc/nginx/conf.d/default.conf

RUN adduser 1001 -g 1000 -D
RUN chown 1001:1000 -R /var/www
RUN chown 1001:1000 -R /etc/nginx
RUN chown 1001:1000 -R /usr/local/bin/docker-entrypoint.sh

ENV BASE_URL=/model
ENV LEGACY_MODE=false
ENV PROXY_CONNECT_TIMEOUT=60s
ENV PROXY_SEND_TIMEOUT=60s
ENV PROXY_READ_TIMEOUT=60s

USER 1001

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
