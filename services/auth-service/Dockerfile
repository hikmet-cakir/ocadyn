# syntax=docker/dockerfile:1

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY settings.gradle build.gradle dependencies.gradle ./
COPY gradle ./gradle
COPY common-lib ./common-lib
COPY auth-service ./auth-service

RUN java -classpath gradle/wrapper/gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain :auth-service:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl
RUN addgroup -S ocadyn && adduser -S ocadyn -G ocadyn
USER ocadyn

COPY --from=build /app/auth-service/build/libs/auth-service.jar app.jar

EXPOSE 9090
ENV SERVER_PORT=9090
ENV SPRING_PROFILES_ACTIVE=docker

ENTRYPOINT ["java", "-jar", "app.jar"]
