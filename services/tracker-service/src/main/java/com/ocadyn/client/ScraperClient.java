package com.ocadyn.client;

import com.ocadyn.common.Marketplace;
import com.ocadyn.config.ApplicationConfig.ScrapeRequest;
import com.ocadyn.config.ApplicationConfig.ScrapeResponse;
import com.ocadyn.config.InternalApiProperties;
import com.ocadyn.security.InternalApiKeyFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

@Component
public class ScraperClient {

    private final RestClient scraperRestClient;
    private final InternalApiProperties internalApiProperties;

    public ScraperClient(RestClient scraperRestClient, InternalApiProperties internalApiProperties) {
        this.scraperRestClient = scraperRestClient;
        this.internalApiProperties = internalApiProperties;
    }

    public ScrapeResult scrape(String url) {
        ScrapeResponse response = scraperRestClient.post()
                .uri("/internal/scrape")
                .header(InternalApiKeyFilter.HEADER_NAME, internalApiProperties.key())
                .body(new ScrapeRequest(url))
                .retrieve()
                .body(ScrapeResponse.class);
        if (response == null) {
            throw new IllegalStateException("Empty scrape response");
        }
        return new ScrapeResult(
                response.title(),
                response.image(),
                response.marketplace(),
                response.price(),
                response.currency()
        );
    }

    public record ScrapeResult(
            String title,
            String image,
            Marketplace marketplace,
            BigDecimal price,
            String currency
    ) {}
}
