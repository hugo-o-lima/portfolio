# Debian-based image (NOT alpine): bcrypt is a native module whose prebuilt
# binaries target glibc. Alpine/musl forces a fragile node-gyp compile.
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
