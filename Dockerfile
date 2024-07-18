# Use an official Node runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with retry mechanism
RUN npm set retry 5 && npm set fetch-timeout 120000 && \
    npm install || npm install || npm install

# Install Angular CLI only if not already installed
RUN if ! npm list -g @angular/cli@18.0.7; then npm install -g @angular/cli@18.0.7; fi

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 4200

# Command to run the app, binding to all interfaces
CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]
