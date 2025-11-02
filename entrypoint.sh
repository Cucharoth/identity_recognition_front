#!/bin/sh

# Substitute environment variables in script.js
envsubst '${API_URL}' < /usr/share/nginx/html/script.js > /usr/share/nginx/html/script.js.tmp
mv /usr/share/nginx/html/script.js.tmp /usr/share/nginx/html/script.js

# Start Nginx
nginx -g 'daemon off;'