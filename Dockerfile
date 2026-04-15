FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80