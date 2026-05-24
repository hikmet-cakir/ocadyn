package com.ocadyn.notification.dto;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.NotificationType;

import java.math.BigDecimal;
import java.time.Instant;

public record NotificationResponse(
        String id,
        String productId,
        String productTitle,
        String productImage,
        Marketplace marketplace,
        NotificationType type,
        String message,
        BigDecimal previousPrice,
        BigDecimal currentPrice,
        String currency,
        boolean read,
        Instant createdAt
) {}
