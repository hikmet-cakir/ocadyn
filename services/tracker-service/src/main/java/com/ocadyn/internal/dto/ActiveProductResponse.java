package com.ocadyn.internal.dto;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.TrackingStatus;
import com.ocadyn.common.dto.ProductNotificationSettingsDto;

import java.math.BigDecimal;
import java.time.Instant;

public record ActiveProductResponse(
        String id,
        String userId,
        String title,
        String image,
        String url,
        Marketplace marketplace,
        BigDecimal currentPrice,
        String currency,
        TrackingStatus trackingStatus,
        Instant lastPriceCheckAt,
        Instant lastNotificationAt,
        ProductNotificationSettingsDto notificationSettings
) {}
