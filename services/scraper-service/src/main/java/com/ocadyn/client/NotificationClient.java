package com.ocadyn.client;

import com.ocadyn.client.dto.CreatePriceChangeNotificationRequest;
import com.ocadyn.config.InternalApiProperties;
import com.ocadyn.security.InternalApiKeyFilter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class NotificationClient {

    private final RestClient notificationRestClient;
    private final InternalApiProperties internalApiProperties;

    public NotificationClient(
            @Qualifier("notificationRestClient") RestClient notificationRestClient,
            InternalApiProperties internalApiProperties
    ) {
        this.notificationRestClient = notificationRestClient;
        this.internalApiProperties = internalApiProperties;
    }

    public void createPriceChangeNotification(CreatePriceChangeNotificationRequest request) {
        notificationRestClient.post()
                .uri("/internal/notifications")
                .header(InternalApiKeyFilter.HEADER_NAME, internalApiProperties.key())
                .body(request)
                .retrieve()
                .toBodilessEntity();
    }
}
