# --- Stage 1: Build React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Build Spring Boot Backend ---
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app
COPY pom.xml .
COPY . .
RUN mvn clean package -DskipTests

# --- Stage 3: Final Runner Container ---
FROM eclipse-temurin:17-jre-alpine
# Install Nginx and envsubst (to handle the Render PORT variable)
RUN apk add --no-cache nginx gettext

# Copy Frontend build to Nginx html folder
COPY --from=frontend-builder /app/build /usr/share/nginx/html

# Copy Backend JAR
COPY --from=backend-builder /app/target/*.jar app.jar

# Copy Nginx config template
COPY nginx.conf /etc/nginx/conf.d/default.template

# Create a start script to run both processes
# 1. Replace $PORT in nginx config
# 2. Start Nginx in background
# 3. Start Java in foreground
CMD ["sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && nginx && java -jar app.jar"]
