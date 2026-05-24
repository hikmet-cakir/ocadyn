# syntax=docker/dockerfile:1

FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY settings.gradle build.gradle dependencies.gradle ./
COPY gradle ./gradle
COPY common-lib ./common-lib
COPY report-service ./report-service

RUN java -classpath gradle/wrapper/gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain :report-service:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl
RUN addgroup -S ocadyn && adduser -S ocadyn -G ocadyn
USER ocadyn

COPY --from=build /app/report-service/build/libs/report-service.jar app.jar

EXPOSE 9094
ENV SERVER_PORT=9094
ENV SPRING_PROFILES_ACTIVE=docker

ENTRYPOINT ["java", "-jar", "app.jar"]
