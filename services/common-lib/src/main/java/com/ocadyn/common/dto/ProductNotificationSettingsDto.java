package com.ocadyn.common.dto;

import com.ocadyn.common.NotificationFrequency;

public record ProductNotificationSettingsDto(
        ProductNotificationChannelsDto channels,
        ProductTriggerSettingsDto triggers,
        NotificationFrequency frequency,
        boolean instantAlertsEnabled
) {}
