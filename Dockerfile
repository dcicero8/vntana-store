FROM nginx:alpine
COPY . /usr/share/nginx/html
# Ensure every file is world-readable: `railway up` preserves local file modes,
# and some vendored files ship as 0600, which nginx (non-root) then can't read (403).
RUN chmod -R a+rX /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
ENV PORT=8080
EXPOSE 8080
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
