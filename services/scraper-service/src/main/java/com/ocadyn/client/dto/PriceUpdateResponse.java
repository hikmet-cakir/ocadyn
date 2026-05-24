package com.ocadyn.client.dto;

import com.ocadyn.common.Marketplace;

import java.math.BigDecimal;

public record PriceUpdateResponse(
        BigDecimal previousPrice,
        BigDecimal currentPrice,
        boolean changed,
        String userId,
        String productId,
        String productTitle,
        String productImage,
        Marketplace marketplace,
        String currency
) {}
