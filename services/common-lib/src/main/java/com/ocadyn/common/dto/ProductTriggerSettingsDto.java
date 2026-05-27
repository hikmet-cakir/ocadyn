package com.ocadyn.common.dto;

import java.math.BigDecimal;

public record ProductTriggerSettingsDto(
        BigDecimal percentDrop,
        BigDecimal percentRise,
        BigDecimal fixedDrop,
        BigDecimal fixedRise
) {}
