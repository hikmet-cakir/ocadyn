package com.ocadyn.internal.dto;

import java.math.BigDecimal;

public record PriceUpdateRequest(BigDecimal newPrice) {}
