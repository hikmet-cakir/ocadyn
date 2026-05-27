package com.ocadyn.product.dto;

import com.ocadyn.common.NotificationFrequency;
import com.ocadyn.product.NotificationChannelSettings;
import com.ocadyn.product.TriggerSettings;

public record NotificationSettingsResponse(
        NotificationChannelSettings channels,
        TriggerSettings triggers,
        NotificationFrequency frequency,
        boolean instantAlertsEnabled
) {}
