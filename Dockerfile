# STAGING branch only: serves this copy of the website on Railway (main is served by GitHub Pages).
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY . /srv
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
