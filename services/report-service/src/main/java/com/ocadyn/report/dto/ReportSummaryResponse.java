package com.ocadyn.report.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReportSummaryResponse(
        BigDecimal averageSavings,
        long totalNotifications,
        String mostTrackedMarketplace,
        int alertSuccessRate,
        List<SavingsDataPoint> savingsChart
) {}
