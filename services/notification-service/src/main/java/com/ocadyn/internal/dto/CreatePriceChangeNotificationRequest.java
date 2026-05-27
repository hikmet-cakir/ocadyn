package com.ocadyn.internal.dto;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.NotificationType;

import java.math.BigDecimal;

public record CreatePriceChangeNotificationRequest(
        String userId,
        String productId,
        String productTitle,
        String productImage,
        Marketplace marketplace,
        BigDecimal previousPrice,
        BigDecimal currentPrice,
        String currency,
        NotificationType type,
        String message
) {
    public CreatePriceChangeNotificationRequest(
            String userId,
            String productId,
            String productTitle,
            String productImage,
            Marketplace marketplace,
            BigDecimal previousPrice,
            BigDecimal currentPrice,
            String currency
    ) {
        this(userId, productId, productTitle, productImage, marketplace, previousPrice, currentPrice, currency, null, null);
    }
}
