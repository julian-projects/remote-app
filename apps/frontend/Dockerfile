# Use Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json tsconfig*.json vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Expose port
EXPOSE 5173

# Start in dev mode (hot reload)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]