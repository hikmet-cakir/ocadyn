package com.ocadyn.security;

import com.ocadyn.config.CorsProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final InternalApiKeyFilter internalApiKeyFilter;
    private final CorsProperties corsProperties;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            InternalApiKeyFilter internalApiKeyFilter,
            CorsProperties corsProperties
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.internalApiKeyFilter = internalApiKeyFilter;
        this.corsProperties = corsProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return ServiceSecuritySupport.buildApiSecurityChain(
                http,
                jwtAuthenticationFilter,
                internalApiKeyFilter,
                corsProperties,
                ServiceSecuritySupport.defaultPublicPaths()
        );
    }
}
