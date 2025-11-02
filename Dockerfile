FROM nginx:alpine

# Install envsubst
RUN apk add --no-cache gettext

# Remove default site files
RUN rm -rf /usr/share/nginx/html/*

# Copy your site files into Nginx’s web directory
COPY . /usr/share/nginx/html

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 80 for HTTP
EXPOSE 80

# Use entrypoint to substitute env vars at runtime
ENTRYPOINT ["/entrypoint.sh"]
