package com.ocadyn.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class, InternalApiProperties.class})
public class ApplicationConfig {}
