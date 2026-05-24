package com.ocadyn.internal.dto;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.TrackingStatus;

import java.math.BigDecimal;

public record ActiveProductResponse(
        String id,
        String userId,
        String title,
        String image,
        String url,
        Marketplace marketplace,
        BigDecimal currentPrice,
        String currency,
        TrackingStatus trackingStatus
) {}
