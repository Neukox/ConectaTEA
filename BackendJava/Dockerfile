FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S conectatea && adduser -S conectatea -G conectatea \
  && apk add --no-cache curl
WORKDIR /app
COPY --from=build /app/target/conectatea-backend-*.jar app.jar
USER conectatea
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/actuator/health/liveness || exit 1
ENTRYPOINT ["java","-jar","/app/app.jar"]

