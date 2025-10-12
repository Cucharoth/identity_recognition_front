FROM nginx:alpine

# Remove default site files
RUN rm -rf /usr/share/nginx/html/*

# Copy your site files into Nginx’s web directory
COPY . /usr/share/nginx/html

# Expose port 80 for HTTP
EXPOSE 80

# Start Nginx (the base image does this automatically)
CMD ["nginx", "-g", "daemon off;"]
