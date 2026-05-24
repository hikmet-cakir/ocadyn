package com.ocadyn.client.dto;

import com.ocadyn.common.Marketplace;

import java.math.BigDecimal;

public record PriceUpdateRequest(BigDecimal newPrice) {}
