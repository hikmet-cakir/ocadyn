package com.ocadyn.report.dto;

import java.math.BigDecimal;

public record ProductMovementHighlight(
        String productId,
        String title,
        String marketplace,
        String currency,
        BigDecimal amount,
        BigDecimal percent
) {}
