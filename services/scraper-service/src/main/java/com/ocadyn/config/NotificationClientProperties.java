package com.ocadyn.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ocadyn.notification")
public record NotificationClientProperties(String baseUrl) {}
