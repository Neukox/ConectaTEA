FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S conectatea && adduser -S conectatea -G conectatea
WORKDIR /app
COPY --from=build /app/target/conectatea-backend-*.jar app.jar
USER conectatea
EXPOSE 3000
ENTRYPOINT ["java","-jar","/app/app.jar"]

