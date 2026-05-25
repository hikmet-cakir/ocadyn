package com.ocadyn.security;

import com.ocadyn.config.CorsProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

public final class ServiceSecuritySupport {

    private ServiceSecuritySupport() {}

    public static SecurityFilterChain buildApiSecurityChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            InternalApiKeyFilter internalApiKeyFilter,
            CorsProperties corsProperties,
            String... publicPaths
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource(corsProperties)))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(publicPaths).permitAll();
                    auth.requestMatchers("/internal/**").permitAll();
                    auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                    auth.anyRequest().authenticated();
                })
                .addFilterBefore(internalApiKeyFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    public static CorsConfigurationSource corsConfigurationSource(CorsProperties corsProperties) {
        CorsConfiguration config = new CorsConfiguration();

        List<String> originPatterns = new ArrayList<>(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        if (corsProperties.allowedOrigins() != null) {
            originPatterns.addAll(corsProperties.allowedOrigins());
        }
        config.setAllowedOriginPatterns(originPatterns);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    public static String[] defaultPublicPaths() {
        return new String[] {
                "/actuator/health",
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html"
        };
    }
}
