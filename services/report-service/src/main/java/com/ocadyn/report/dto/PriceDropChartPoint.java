package com.ocadyn.report.dto;

import java.math.BigDecimal;

public record PriceDropChartPoint(int month, int year, BigDecimal amount) {}
