package com.ocadyn.product.dto;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.NotificationFrequency;
import com.ocadyn.common.TrackingStatus;
import com.ocadyn.product.NotificationChannelSettings;
import com.ocadyn.product.PricePoint;
import com.ocadyn.product.TriggerSettings;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductResponse(
        String id,
        String title,
        String image,
        String url,
        Marketplace marketplace,
        BigDecimal currentPrice,
        BigDecimal lowestPrice,
        BigDecimal highestPrice,
        String currency,
        BigDecimal changePercent,
        List<PricePoint> priceHistory,
        NotificationSettingsResponse notificationSettings,
        TrackingStatus trackingStatus,
        boolean favorite,
        Instant lastUpdated
) {}
