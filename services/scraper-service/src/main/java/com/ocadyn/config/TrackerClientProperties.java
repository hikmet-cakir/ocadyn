package com.ocadyn.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ocadyn.tracker")
public record TrackerClientProperties(String baseUrl) {}
