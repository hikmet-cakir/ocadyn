package com.ocadyn.product;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class PriceHistoryUtils {

    private PriceHistoryUtils() {}

    public static void upsertDailyPoint(List<PricePoint> history, BigDecimal price, Instant at) {
        if (history == null) {
            return;
        }
        if (history.isEmpty()) {
            history.add(new PricePoint(at, price));
            return;
        }
        PricePoint last = history.get(history.size() - 1);
        LocalDate lastDay = toUtcDay(last.getDate());
        LocalDate today = toUtcDay(at);
        if (lastDay.equals(today)) {
            last.setPrice(price);
            last.setDate(at);
            return;
        }
        history.add(new PricePoint(at, price));
    }

    public static List<PricePoint> compactByDay(List<PricePoint> history) {
        if (history == null || history.isEmpty()) {
            return List.of();
        }
        List<PricePoint> sorted = history.stream()
                .filter(point -> point.getDate() != null && point.getPrice() != null)
                .sorted(Comparator.comparing(PricePoint::getDate))
                .toList();
        Map<LocalDate, PricePoint> byDay = new LinkedHashMap<>();
        for (PricePoint point : sorted) {
            LocalDate day = toUtcDay(point.getDate());
            byDay.put(day, new PricePoint(point.getDate(), point.getPrice()));
        }
        return new ArrayList<>(byDay.values());
    }

    private static LocalDate toUtcDay(Instant instant) {
        return instant.atZone(ZoneOffset.UTC).toLocalDate();
    }
}
