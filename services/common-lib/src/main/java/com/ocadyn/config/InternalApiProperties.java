package com.ocadyn.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ocadyn.internal-api")
public record InternalApiProperties(String key) {}
