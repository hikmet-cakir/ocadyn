package com.ocadyn.client;

import com.ocadyn.client.dto.ActiveProductResponse;
import com.ocadyn.client.dto.CreatePriceChangeNotificationRequest;
import com.ocadyn.client.dto.PriceUpdateRequest;
import com.ocadyn.client.dto.PriceUpdateResponse;
import com.ocadyn.config.InternalApiProperties;
import com.ocadyn.security.InternalApiKeyFilter;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class TrackerClient {

    private final RestClient trackerRestClient;
    private final InternalApiProperties internalApiProperties;

    public TrackerClient(
            @Qualifier("trackerRestClient") RestClient trackerRestClient,
            InternalApiProperties internalApiProperties
    ) {
        this.trackerRestClient = trackerRestClient;
        this.internalApiProperties = internalApiProperties;
    }

    public List<ActiveProductResponse> listActiveProducts() {
        return trackerRestClient.get()
                .uri("/internal/products/active")
                .header(InternalApiKeyFilter.HEADER_NAME, internalApiProperties.key())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public PriceUpdateResponse updatePrice(String productId, PriceUpdateRequest request) {
        return trackerRestClient.patch()
                .uri("/internal/products/{id}/price", productId)
                .header(InternalApiKeyFilter.HEADER_NAME, internalApiProperties.key())
                .body(request)
                .retrieve()
                .body(PriceUpdateResponse.class);
    }
}
