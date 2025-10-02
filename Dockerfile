# Use an official Node.js runtime as a parent image
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# Build the app
RUN npm run build

# Use a smaller, lightweight node image for the final image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy the build output from the build stage
COPY --from=build /app/dist ./dist

# Expose the port the app runs on
EXPOSE 8080

# Serve the static files
CMD ["npx", "http-server", "dist", "-p", "8080"]
