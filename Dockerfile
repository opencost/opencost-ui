FROM node:18.3.0 as builder
ADD package*.json /opt/ui/
WORKDIR /opt/ui
RUN npm install
ADD src /opt/ui/src
RUN npx parcel build src/index.html

FROM nginx:alpine

LABEL org.opencontainers.image.description="Cross-cloud cost allocation models for Kubernetes workloads"
LABEL org.opencontainers.image.documentation=https://opencost.io/docs/
LABEL org.opencontainers.image.licenses=Apache-2.0
LABEL org.opencontainers.image.source=https://github.com/opencost/opencost-ui
LABEL org.opencontainers.image.title=opencost-ui
LABEL org.opencontainers.image.url=https://opencost.io

ARG version=dev
ARG	commit=HEAD
ENV VERSION=${version}
ENV HEAD=${commit}

ENV API_PORT=9003
ENV API_SERVER=0.0.0.0
ENV UI_PORT=9090

COPY --from=builder /opt/ui/dist /opt/ui/dist
RUN mkdir -p /var/www

COPY THIRD_PARTY_LICENSES.txt /THIRD_PARTY_LICENSES.txt
COPY --from=builder /opt/ui/dist /var/www

COPY default.nginx.conf.template /etc/nginx/conf.d/default.nginx.conf.template
COPY nginx.conf /etc/nginx/
COPY ./docker-entrypoint.sh /usr/local/bin/

RUN rm -rf /etc/nginx/conf.d/default.conf

RUN adduser 1001 -g 1000 -D
RUN chown 1001:0 -R /var/www && \
    chmod -R g=u /var/www
RUN chown 1001:0 -R /etc/nginx && \
    chmod -R g=u /etc/nginx
RUN chown 1001:0 -R /usr/local/bin/docker-entrypoint.sh && \
    chmod 775 /usr/local/bin/docker-entrypoint.sh

ENV BASE_URL=/model

USER 1001

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
