package com.ocadyn.common.dto;

public record ProductNotificationChannelsDto(
        boolean email,
        boolean sms,
        boolean phone,
        boolean push
) {}
