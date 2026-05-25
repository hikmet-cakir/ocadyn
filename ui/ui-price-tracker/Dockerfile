# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

ARG PUBLIC_API_BASE_URL=
ENV PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL

COPY ui/ui-price-tracker/package*.json ./
RUN npm ci

COPY ui/ui-price-tracker ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

EXPOSE 4321

CMD ["serve", "-s", "dist", "-l", "4321"]
