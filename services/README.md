# OCADYN — Backend Services

Gradle multi-module monorepo. Run all commands from this directory.

## Modules

| Module | Port (`application.yml`) |
|--------|--------------------------|
| auth-service | 9090 |
| notification-service | 9091 |
| user-service | 9092 |
| scraper-service | 9092 |

## Commands

```bash
./gradlew clean build
./gradlew :auth-service:bootRun
```
