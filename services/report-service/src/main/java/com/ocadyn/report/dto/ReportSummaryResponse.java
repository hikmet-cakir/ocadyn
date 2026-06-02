package com.ocadyn.report.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReportSummaryResponse(
        BigDecimal totalPriceDrop,
        int productsWithDropCount,
        BigDecimal monthOverMonthDropChange,
        String displayCurrency,
        ProductMovementHighlight biggestDrop,
        ProductMovementHighlight biggestIncrease,
        int stablePriceProductCount,
        long totalNotifications,
        long priceDropNotificationCount,
        String mostTrackedMarketplace,
        int mostTrackedMarketplaceCount,
        List<PriceDropChartPoint> priceDropChart
) {}
