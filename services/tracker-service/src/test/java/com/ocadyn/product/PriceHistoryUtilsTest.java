package com.ocadyn.product;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PriceHistoryUtilsTest {

    @Test
    void upsertDailyPoint_shouldReturn_whenHistoryNull() {
        PriceHistoryUtils.upsertDailyPoint(null, new BigDecimal("10"), Instant.parse("2026-01-01T00:00:00Z"));
    }

    @Test
    void upsertDailyPoint_shouldAddFirstPoint_whenHistoryEmpty() {
        List<PricePoint> history = new ArrayList<>();

        PriceHistoryUtils.upsertDailyPoint(history, new BigDecimal("10"), Instant.parse("2026-01-01T00:00:00Z"));

        assertEquals(1, history.size());
        assertEquals(new BigDecimal("10"), history.getFirst().getPrice());
    }

    @Test
    void upsertDailyPoint_shouldUpdateLastPoint_whenSameUtcDay() {
        List<PricePoint> history = new ArrayList<>();
        history.add(new PricePoint(Instant.parse("2026-01-01T01:00:00Z"), new BigDecimal("10")));

        PriceHistoryUtils.upsertDailyPoint(history, new BigDecimal("11"), Instant.parse("2026-01-01T22:00:00Z"));

        assertEquals(1, history.size());
        assertEquals(new BigDecimal("11"), history.getFirst().getPrice());
        assertEquals(Instant.parse("2026-01-01T22:00:00Z"), history.getFirst().getDate());
    }

    @Test
    void upsertDailyPoint_shouldAppendPoint_whenDifferentUtcDay() {
        List<PricePoint> history = new ArrayList<>();
        history.add(new PricePoint(Instant.parse("2026-01-01T22:00:00Z"), new BigDecimal("10")));

        PriceHistoryUtils.upsertDailyPoint(history, new BigDecimal("12"), Instant.parse("2026-01-02T00:01:00Z"));

        assertEquals(2, history.size());
        assertEquals(new BigDecimal("12"), history.get(1).getPrice());
    }

    @Test
    void compactByDay_shouldReturnEmpty_whenInputNullOrEmpty() {
        assertTrue(PriceHistoryUtils.compactByDay(null).isEmpty());
        assertTrue(PriceHistoryUtils.compactByDay(List.of()).isEmpty());
    }

    @Test
    void compactByDay_shouldFilterInvalidSortAndKeepLastPointOfDay() {
        List<PricePoint> history = List.of(
                new PricePoint(Instant.parse("2026-01-02T10:00:00Z"), new BigDecimal("20")),
                new PricePoint(Instant.parse("2026-01-01T09:00:00Z"), new BigDecimal("10")),
                new PricePoint(Instant.parse("2026-01-01T21:00:00Z"), new BigDecimal("11")),
                new PricePoint(Instant.parse("2026-01-02T23:59:00Z"), new BigDecimal("21")),
                new PricePoint(null, new BigDecimal("99")),
                new PricePoint(Instant.parse("2026-01-03T01:00:00Z"), null)
        );

        List<PricePoint> compact = PriceHistoryUtils.compactByDay(history);

        assertEquals(2, compact.size());
        assertEquals(Instant.parse("2026-01-01T21:00:00Z"), compact.get(0).getDate());
        assertEquals(new BigDecimal("11"), compact.get(0).getPrice());
        assertEquals(Instant.parse("2026-01-02T23:59:00Z"), compact.get(1).getDate());
        assertEquals(new BigDecimal("21"), compact.get(1).getPrice());
    }
}
