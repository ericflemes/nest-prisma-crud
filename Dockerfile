# Base image
FROM node:18-alpine

# Install OpenSSL
RUN apk add --no-cache openssl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Set DATABASE_URL for Prisma generate
ENV DATABASE_URL="mysql://nest:nest123@db:3306/nest_crud"

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3001

# Execute migration and start application
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && npm run start:prod"]