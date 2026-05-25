package com.ocadyn.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ocadyn.common.Marketplace;
import com.ocadyn.common.exception.ApiException;
import com.ocadyn.config.ApplicationConfig.ScrapeRequest;
import com.ocadyn.config.ApplicationConfig.ScrapeResponse;
import com.ocadyn.config.InternalApiProperties;
import com.ocadyn.security.InternalApiKeyFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class ScraperClient {

    private final RestClient scraperRestClient;
    private final InternalApiProperties internalApiProperties;
    private final ObjectMapper objectMapper;

    public ScraperClient(
            RestClient scraperRestClient,
            InternalApiProperties internalApiProperties,
            ObjectMapper objectMapper
    ) {
        this.scraperRestClient = scraperRestClient;
        this.internalApiProperties = internalApiProperties;
        this.objectMapper = objectMapper;
    }

    public ScrapeResult scrape(String url) {
        try {
            ScrapeResponse response = scraperRestClient.post()
                    .uri("/internal/scrape")
                    .header(InternalApiKeyFilter.HEADER_NAME, internalApiProperties.key())
                    .body(new ScrapeRequest(url))
                    .retrieve()
                    .body(ScrapeResponse.class);
            if (response == null) {
                throw new ApiException(502, "Empty scrape response");
            }
            return new ScrapeResult(
                    response.title(),
                    response.image(),
                    response.marketplace(),
                    response.price(),
                    response.currency()
            );
        } catch (RestClientResponseException ex) {
            throw new ApiException(ex.getStatusCode().value(), extractMessage(ex));
        }
    }

    private String extractMessage(RestClientResponseException ex) {
        try {
            Map<?, ?> body = objectMapper.readValue(ex.getResponseBodyAsString(), Map.class);
            if (body != null && body.get("message") != null) {
                return body.get("message").toString();
            }
        } catch (Exception ignored) {
            // fall through
        }
        return "Could not scrape product details";
    }

    public record ScrapeResult(
            String title,
            String image,
            Marketplace marketplace,
            BigDecimal price,
            String currency
    ) {}
}
