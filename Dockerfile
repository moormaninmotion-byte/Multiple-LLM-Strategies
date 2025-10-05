# ---- Build Stage ----
# Use a specific Node.js version with Alpine Linux for a smaller base image.
FROM node:20-alpine AS build

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching.
# This step will only be re-run if these files change.
COPY package*.json ./

# Install all dependencies, including devDependencies needed for the build.
RUN npm install

# Copy the rest of the application source code.
COPY . .

# Run the Vite build script to generate static assets in the /dist folder.
RUN npm run build

# ---- Runtime Stage ----
# Start from a fresh, lightweight Node.js image.
FROM node:20-alpine

WORKDIR /app

# Copy the static assets from the build stage.
COPY --from=build /app/dist ./dist

# Install the 'serve' package globally to act as a simple, efficient web server.
RUN npm install -g serve

# Expose port 8080 to match the Cloud Run configuration in your cloudbuild.yaml.
EXPOSE 8080

# The command to run when the container starts.
# 'serve -s dist' serves the 'dist' directory.
# The '-s' flag is crucial for single-page applications (SPAs) to handle client-side routing correctly.
# '-l 8080' tells serve to listen on port 8080.
CMD [ "serve", "-s", "dist", "-l", "8080" ]
