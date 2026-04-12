FROM node:20-alpine

WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy rest of the app
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]