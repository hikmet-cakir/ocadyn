package com.ocadyn.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({TrackerClientProperties.class, NotificationClientProperties.class})
public class ApplicationConfig {

    @Bean
    @Qualifier("trackerRestClient")
    RestClient trackerRestClient(TrackerClientProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .build();
    }

    @Bean
    @Qualifier("notificationRestClient")
    RestClient notificationRestClient(NotificationClientProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .build();
    }
}
