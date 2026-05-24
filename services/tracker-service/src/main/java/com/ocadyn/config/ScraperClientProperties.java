package com.ocadyn.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ocadyn.scraper")
public record ScraperClientProperties(String baseUrl) {}
