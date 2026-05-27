package com.ocadyn.client.dto;

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
        String message,
        boolean sendEmail
) {}
