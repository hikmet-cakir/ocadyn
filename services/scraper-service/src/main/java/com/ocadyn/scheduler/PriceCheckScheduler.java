package com.ocadyn.scheduler;

import com.ocadyn.client.NotificationClient;
import com.ocadyn.client.TrackerClient;
import com.ocadyn.client.dto.ActiveProductResponse;
import com.ocadyn.client.dto.CreatePriceChangeNotificationRequest;
import com.ocadyn.client.dto.PriceUpdateRequest;
import com.ocadyn.client.dto.PriceUpdateResponse;
import com.ocadyn.common.NotificationType;
import com.ocadyn.common.dto.ProductNotificationSettingsDto;
import com.ocadyn.scraper.NotificationDeliveryPolicy;
import com.ocadyn.scraper.PriceScraperService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
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

    @Scheduled(fixedDelayString = "${ocadyn.price-check.delay-ms:300000}")
    public void checkPrices() {
        log.info("Running scheduled price check");
        List<ActiveProductResponse> activeProducts = trackerClient.listActiveProducts();
        if (activeProducts == null || activeProducts.isEmpty()) {
            return;
        }

        Instant now = Instant.now();
        for (ActiveProductResponse product : activeProducts) {
            if (!NotificationDeliveryPolicy.isPriceCheckDue(product, now)) {
                continue;
            }
            try {
                ProductNotificationSettingsDto settings = product.notificationSettings();
                if (settings == null || settings.channels() == null || !settings.channels().push()) {
                    continue;
                }

                BigDecimal next = priceScraperService.refreshPrice(product.url(), product.currentPrice());
                PriceUpdateResponse update = trackerClient.updatePrice(
                        product.id(),
                        new PriceUpdateRequest(next)
                );
                if (update == null) {
                    continue;
                }

                boolean thresholdAlert = NotificationDeliveryPolicy.shouldSendThresholdAlert(settings, update);
                boolean periodicDue = NotificationDeliveryPolicy.shouldSendPeriodicNotification(
                        settings,
                        product,
                        now
                );

                if (!thresholdAlert && !periodicDue) {
                    continue;
                }

                if (thresholdAlert) {
                    NotificationType type = update.currentPrice().compareTo(update.previousPrice()) < 0
                            ? NotificationType.PRICE_DROP
                            : NotificationType.PRICE_INCREASE;
                    sendNotification(
                            product,
                            update,
                            settings,
                            type,
                            NotificationDeliveryPolicy.buildThresholdMessage(update)
                    );
                }

                if (periodicDue) {
                    sendNotification(
                            product,
                            update,
                            settings,
                            NotificationType.SYSTEM,
                            NotificationDeliveryPolicy.buildPeriodicMessage(update)
                    );
                    trackerClient.recordPeriodicNotification(product.id());
                }
            } catch (RuntimeException ex) {
                log.warn("Price refresh failed for product {}: {}", product.id(), ex.getMessage());
            }
        }
    }

    private void sendNotification(
            ActiveProductResponse product,
            PriceUpdateResponse update,
            ProductNotificationSettingsDto settings,
            NotificationType type,
            String message
    ) {
        boolean sendEmail = settings.channels() != null && settings.channels().email();
        notificationClient.createPriceChangeNotification(new CreatePriceChangeNotificationRequest(
                update.userId(),
                update.productId(),
                update.productTitle(),
                update.productImage(),
                update.marketplace(),
                update.previousPrice(),
                update.currentPrice(),
                update.currency(),
                type,
                message,
                sendEmail
        ));
    }
}

