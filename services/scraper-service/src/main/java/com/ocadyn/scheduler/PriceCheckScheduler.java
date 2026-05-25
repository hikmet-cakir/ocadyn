package com.ocadyn.scheduler;

import com.ocadyn.client.NotificationClient;
import com.ocadyn.client.TrackerClient;
import com.ocadyn.client.dto.ActiveProductResponse;
import com.ocadyn.client.dto.CreatePriceChangeNotificationRequest;
import com.ocadyn.client.dto.PriceUpdateRequest;
import com.ocadyn.client.dto.PriceUpdateResponse;
import com.ocadyn.scraper.PriceScraperService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class PriceCheckScheduler {

    private static final Logger log = LoggerFactory.getLogger(PriceCheckScheduler.class);

    private final TrackerClient trackerClient;
    private final NotificationClient notificationClient;
    private final PriceScraperService priceScraperService;

    public PriceCheckScheduler(
            TrackerClient trackerClient,
            NotificationClient notificationClient,
            PriceScraperService priceScraperService
    ) {
        this.trackerClient = trackerClient;
        this.notificationClient = notificationClient;
        this.priceScraperService = priceScraperService;
    }

    @Scheduled(fixedDelayString = "${ocadyn.price-check.delay-ms:3600000}")
    public void checkPrices() {
        log.info("Running scheduled price check");
        List<ActiveProductResponse> activeProducts = trackerClient.listActiveProducts();
        if (activeProducts == null || activeProducts.isEmpty()) {
            return;
        }

        for (ActiveProductResponse product : activeProducts) {
            try {
                BigDecimal next = priceScraperService.refreshPrice(product.url(), product.currentPrice());
                PriceUpdateResponse update = trackerClient.updatePrice(
                        product.id(),
                        new PriceUpdateRequest(next)
                );
                if (update != null && update.changed()) {
                    notificationClient.createPriceChangeNotification(new CreatePriceChangeNotificationRequest(
                            update.userId(),
                            update.productId(),
                            update.productTitle(),
                            update.productImage(),
                            update.marketplace(),
                            update.previousPrice(),
                            update.currentPrice(),
                            update.currency()
                    ));
                }
            } catch (RuntimeException ex) {
                log.warn("Price refresh failed for product {}: {}", product.id(), ex.getMessage());
            }
        }
    }
}
