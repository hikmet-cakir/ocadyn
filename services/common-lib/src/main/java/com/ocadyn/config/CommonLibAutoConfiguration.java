package com.ocadyn.config;

import com.ocadyn.common.exception.GlobalExceptionHandler;
import com.ocadyn.security.JwtAuthenticationFilter;
import com.ocadyn.security.JwtService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class, InternalApiProperties.class})
@ComponentScan(basePackageClasses = {
        JwtService.class,
        JwtAuthenticationFilter.class,
        com.ocadyn.security.CurrentUserResolver.class,
        com.ocadyn.security.InternalApiKeyFilter.class,
        GlobalExceptionHandler.class
})
@Import(GlobalExceptionHandler.class)
public class CommonLibAutoConfiguration {}
