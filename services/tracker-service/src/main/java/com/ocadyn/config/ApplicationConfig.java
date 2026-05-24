package com.ocadyn.config;

import com.ocadyn.common.Marketplace;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

@Configuration
@EnableMongoAuditing
@EnableConfigurationProperties({ScraperClientProperties.class})
public class ApplicationConfig {

    @Bean
    RestClient scraperRestClient(ScraperClientProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .build();
    }

    public record ScrapeRequest(String url) {}

    public record ScrapeResponse(
            String title,
            String image,
            Marketplace marketplace,
            BigDecimal price,
            String currency
    ) {}
}
