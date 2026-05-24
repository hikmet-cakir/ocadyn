package com.ocadyn.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "ocadyn.cors")
public record CorsProperties(List<String> allowedOrigins) {}
