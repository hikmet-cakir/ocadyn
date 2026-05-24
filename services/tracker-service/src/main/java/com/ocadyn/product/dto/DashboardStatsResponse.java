package com.ocadyn.product.dto;

public record DashboardStatsResponse(
        long total,
        long dropped,
        long increased,
        long unchanged
) {}
