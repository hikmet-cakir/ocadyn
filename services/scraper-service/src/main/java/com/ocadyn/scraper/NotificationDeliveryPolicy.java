package com.ocadyn.scraper;

import com.ocadyn.client.dto.ActiveProductResponse;
import com.ocadyn.client.dto.PriceUpdateResponse;
import com.ocadyn.common.NotificationFrequency;
import com.ocadyn.common.dto.ProductNotificationSettingsDto;
import com.ocadyn.common.dto.ProductTriggerSettingsDto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

public final class NotificationDeliveryPolicy {

    public static final Duration THRESHOLD_CHECK_INTERVAL = Duration.ofMinutes(5);
    /** Clock-aligned schedule for periodic alerts (Turkey local time). */
    private static final ZoneId SCHEDULE_ZONE = ZoneId.of("Europe/Istanbul");

    private NotificationDeliveryPolicy() {}

    public static boolean isPriceCheckDue(ActiveProductResponse product, Instant now) {
        ProductNotificationSettingsDto settings = product.notificationSettings();
        if (settings == null || settings.frequency() == null) {
            return true;
        }
        Instant lastCheck = product.lastPriceCheckAt();
        if (lastCheck == null) {
            return true;
        }
        Duration interval = isInstantAlertsEnabled(settings)
                ? THRESHOLD_CHECK_INTERVAL
                : intervalFor(settings.frequency());
        return !lastCheck.plus(interval).isAfter(now);
    }

    public static boolean isPeriodicNotificationDue(ActiveProductResponse product, Instant now) {
        ProductNotificationSettingsDto settings = product.notificationSettings();
        if (settings == null || settings.frequency() == null) {
            return true;
        }
        Instant lastNotification = product.lastNotificationAt();
        if (lastNotification == null) {
            return true;
        }
        return isClockPeriodElapsed(settings.frequency(), lastNotification, now);
    }

    public static boolean shouldSendThresholdAlert(
            ProductNotificationSettingsDto settings,
            PriceUpdateResponse update
    ) {
        if (!isInstantAlertsEnabled(settings)) {
            return false;
        }
        if (settings.channels() == null || !settings.channels().push()) {
            return false;
        }
        if (!update.changed()) {
            return false;
        }
        if (!hasTriggerRules(settings.triggers())) {
            return true;
        }
        return matchesTriggerRules(settings.triggers(), update.previousPrice(), update.currentPrice());
    }

    public static boolean shouldSendPeriodicNotification(
            ProductNotificationSettingsDto settings,
            ActiveProductResponse product,
            Instant now
    ) {
        if (settings == null || settings.channels() == null || !settings.channels().push()) {
            return false;
        }
        return isPeriodicNotificationDue(product, now);
    }

    public static String buildThresholdMessage(PriceUpdateResponse update) {
        BigDecimal previous = update.previousPrice();
        BigDecimal current = update.currentPrice();
        if (current.compareTo(previous) < 0) {
            BigDecimal percent = percentChange(previous, current);
            return "Price dropped by " + percent + "%";
        }
        if (current.compareTo(previous) > 0) {
            BigDecimal percent = percentChange(previous, current);
            return "Price increased by " + percent + "%";
        }
        return "Scheduled price update: " + update.currentPrice() + " " + update.currency();
    }

    public static String buildPeriodicMessage(PriceUpdateResponse update) {
        return "Scheduled price update: " + update.currentPrice() + " " + update.currency();
    }

    private static boolean isInstantAlertsEnabled(ProductNotificationSettingsDto settings) {
        return settings != null && settings.instantAlertsEnabled();
    }

    private static boolean isClockPeriodElapsed(
            NotificationFrequency frequency,
            Instant lastNotification,
            Instant now
    ) {
        if (!now.isAfter(lastNotification)) {
            return false;
        }
        ZonedDateTime lastZ = lastNotification.atZone(SCHEDULE_ZONE);
        ZonedDateTime nowZ = now.atZone(SCHEDULE_ZONE);
        return switch (frequency) {
            case HOURLY -> lastZ.truncatedTo(ChronoUnit.HOURS).isBefore(nowZ.truncatedTo(ChronoUnit.HOURS));
            case SIX_HOURS -> sixHourBlock(lastZ) < sixHourBlock(nowZ);
            case TWELVE_HOURS -> twelveHourBlock(lastZ) < twelveHourBlock(nowZ);
            case DAILY -> lastZ.truncatedTo(ChronoUnit.DAYS).isBefore(nowZ.truncatedTo(ChronoUnit.DAYS));
            case WEEKLY -> weekBlock(lastZ) < weekBlock(nowZ);
        };
    }

    private static long sixHourBlock(ZonedDateTime z) {
        return z.toLocalDate().toEpochDay() * 4L + (z.getHour() / 6);
    }

    private static long twelveHourBlock(ZonedDateTime z) {
        return z.toLocalDate().toEpochDay() * 2L + (z.getHour() / 12);
    }

    private static long weekBlock(ZonedDateTime z) {
        return z.toLocalDate().toEpochDay() / 7;
    }

    private static boolean hasTriggerRules(ProductTriggerSettingsDto triggers) {
        if (triggers == null) {
            return false;
        }
        return triggers.percentDrop() != null
                || triggers.percentRise() != null
                || triggers.fixedDrop() != null
                || triggers.fixedRise() != null;
    }

    private static boolean matchesTriggerRules(
            ProductTriggerSettingsDto triggers,
            BigDecimal previous,
            BigDecimal current
    ) {
        if (previous.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        BigDecimal delta = current.subtract(previous);
        if (delta.compareTo(BigDecimal.ZERO) < 0) {
            BigDecimal dropAmount = previous.subtract(current);
            BigDecimal dropPercent = percentChange(previous, current);
            if (triggers.percentDrop() != null && dropPercent.compareTo(triggers.percentDrop()) >= 0) {
                return true;
            }
            return triggers.fixedDrop() != null && dropAmount.compareTo(triggers.fixedDrop()) >= 0;
        }
        if (delta.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal riseAmount = current.subtract(previous);
            BigDecimal risePercent = percentChange(previous, current);
            if (triggers.percentRise() != null && risePercent.compareTo(triggers.percentRise()) >= 0) {
                return true;
            }
            return triggers.fixedRise() != null && riseAmount.compareTo(triggers.fixedRise()) >= 0;
        }
        return false;
    }

    private static BigDecimal percentChange(BigDecimal previous, BigDecimal current) {
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .abs()
                .setScale(1, RoundingMode.HALF_UP);
    }

    private static Duration intervalFor(NotificationFrequency frequency) {
        return switch (frequency) {
            case HOURLY -> Duration.ofHours(1);
            case SIX_HOURS -> Duration.ofHours(6);
            case TWELVE_HOURS -> Duration.ofHours(12);
            case DAILY -> Duration.ofDays(1);
            case WEEKLY -> Duration.ofDays(7);
        };
    }
}
