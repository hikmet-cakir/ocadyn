package com.ocadyn.report;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.NotificationType;
import com.ocadyn.report.dto.PriceDropChartPoint;
import com.ocadyn.report.dto.ProductMovementHighlight;
import com.ocadyn.report.dto.ReportSummaryResponse;
import com.ocadyn.report.model.NotificationDocument;
import com.ocadyn.report.model.TrackedProductDocument;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ReportService {

    private final MongoTemplate mongoTemplate;

    public ReportService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public ReportSummaryResponse getSummary(String userId) {
        List<TrackedProductDocument> products = mongoTemplate.find(
                Query.query(Criteria.where("userId").is(userId))
                        .with(Sort.by(Sort.Direction.DESC, "createdAt")),
                TrackedProductDocument.class
        );

        List<NotificationDocument> notifications = mongoTemplate.find(
                Query.query(Criteria.where("userId").is(userId))
                        .with(Sort.by(Sort.Direction.DESC, "createdAt")),
                NotificationDocument.class
        );

        BigDecimal totalPriceDrop = BigDecimal.ZERO;
        int productsWithDropCount = 0;
        int stablePriceProductCount = 0;
        TrackedProductDocument biggestDropProduct = null;
        BigDecimal biggestDropAmount = BigDecimal.ZERO;
        TrackedProductDocument biggestIncreaseProduct = null;
        BigDecimal biggestIncreaseAmount = BigDecimal.ZERO;
        Map<String, Long> currencyCounts = new HashMap<>();

        for (TrackedProductDocument product : products) {
            String currency = product.getCurrency() == null ? "USD" : product.getCurrency();
            currencyCounts.merge(currency, 1L, Long::sum);

            BigDecimal drop = estimateDrop(product);
            if (drop.compareTo(BigDecimal.ZERO) > 0) {
                totalPriceDrop = totalPriceDrop.add(drop);
                productsWithDropCount++;
                if (drop.compareTo(biggestDropAmount) > 0) {
                    biggestDropAmount = drop;
                    biggestDropProduct = product;
                }
            } else {
                stablePriceProductCount++;
            }

            BigDecimal increase = estimateIncrease(product);
            if (increase.compareTo(BigDecimal.ZERO) > 0 && increase.compareTo(biggestIncreaseAmount) > 0) {
                biggestIncreaseAmount = increase;
                biggestIncreaseProduct = product;
            }
        }

        String displayCurrency = currencyCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("USD");

        Map<Marketplace, Long> marketplaceCounts = new EnumMap<>(Marketplace.class);
        for (TrackedProductDocument product : products) {
            marketplaceCounts.merge(product.getMarketplace(), 1L, Long::sum);
        }
        Marketplace topMarketplace = marketplaceCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(Marketplace.OTHER);
        int mostTrackedMarketplaceCount = marketplaceCounts.getOrDefault(topMarketplace, 0L).intValue();

        long totalAlerts = notifications.size();
        long priceDropNotifications = notifications.stream()
                .filter(n -> n.getType() == NotificationType.PRICE_DROP)
                .count();

        YearMonth currentMonth = YearMonth.now(ZoneOffset.UTC);
        YearMonth previousMonth = currentMonth.minusMonths(1);
        BigDecimal currentMonthDrops = computeMonthlyDrops(products, currentMonth);
        BigDecimal previousMonthDrops = computeMonthlyDrops(products, previousMonth);
        BigDecimal monthOverMonthDropChange = currentMonthDrops.subtract(previousMonthDrops);

        return new ReportSummaryResponse(
                totalPriceDrop.setScale(2, RoundingMode.HALF_UP),
                productsWithDropCount,
                monthOverMonthDropChange.setScale(2, RoundingMode.HALF_UP),
                displayCurrency,
                toHighlight(biggestDropProduct, biggestDropAmount, true),
                toHighlight(biggestIncreaseProduct, biggestIncreaseAmount, false),
                stablePriceProductCount,
                totalAlerts,
                priceDropNotifications,
                topMarketplace.name(),
                mostTrackedMarketplaceCount,
                buildPriceDropChart(products)
        );
    }

    private BigDecimal estimateDrop(TrackedProductDocument product) {
        if (product.getHighestPrice().compareTo(product.getCurrentPrice()) <= 0) {
            return BigDecimal.ZERO;
        }
        return product.getHighestPrice().subtract(product.getCurrentPrice()).max(BigDecimal.ZERO);
    }

    private BigDecimal estimateIncrease(TrackedProductDocument product) {
        if (product.getLowestPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (product.getCurrentPrice().compareTo(product.getLowestPrice()) <= 0) {
            return BigDecimal.ZERO;
        }
        return product.getCurrentPrice().subtract(product.getLowestPrice()).max(BigDecimal.ZERO);
    }

    private ProductMovementHighlight toHighlight(
            TrackedProductDocument product,
            BigDecimal amount,
            boolean drop
    ) {
        if (product == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal percent;
        if (drop) {
            percent = percentChange(amount, product.getHighestPrice());
        } else {
            percent = percentChange(amount, product.getLowestPrice());
        }

        return new ProductMovementHighlight(
                product.getId(),
                Objects.toString(product.getTitle(), "Product"),
                product.getMarketplace().name(),
                product.getCurrency() == null ? "USD" : product.getCurrency(),
                amount.setScale(2, RoundingMode.HALF_UP),
                percent
        );
    }

    private BigDecimal percentChange(BigDecimal delta, BigDecimal base) {
        if (base.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return delta.multiply(BigDecimal.valueOf(100))
                .divide(base, 1, RoundingMode.HALF_UP);
    }

    private BigDecimal computeMonthlyDrops(List<TrackedProductDocument> products, YearMonth month) {
        BigDecimal total = BigDecimal.ZERO;
        for (TrackedProductDocument product : products) {
            total = total.add(sumDropsInMonth(product, month));
        }
        return total;
    }

    private BigDecimal sumDropsInMonth(TrackedProductDocument product, YearMonth month) {
        BigDecimal total = BigDecimal.ZERO;
        List<TrackedProductDocument.PricePointDocument> history = product.getPriceHistory().stream()
                .sorted(Comparator.comparing(p -> p.getDate() == null ? Instant.EPOCH : p.getDate()))
                .toList();

        for (int i = 1; i < history.size(); i++) {
            TrackedProductDocument.PricePointDocument previous = history.get(i - 1);
            TrackedProductDocument.PricePointDocument current = history.get(i);
            if (previous.getPrice().compareTo(current.getPrice()) <= 0 || current.getDate() == null) {
                continue;
            }
            YearMonth pointMonth = YearMonth.from(current.getDate().atZone(ZoneOffset.UTC));
            if (pointMonth.equals(month)) {
                total = total.add(previous.getPrice().subtract(current.getPrice()));
            }
        }
        return total;
    }

    private List<PriceDropChartPoint> buildPriceDropChart(List<TrackedProductDocument> products) {
        Map<YearMonth, BigDecimal> byMonth = new HashMap<>();
        for (TrackedProductDocument product : products) {
            List<TrackedProductDocument.PricePointDocument> history = product.getPriceHistory().stream()
                    .sorted(Comparator.comparing(p -> p.getDate() == null ? Instant.EPOCH : p.getDate()))
                    .toList();

            for (int i = 1; i < history.size(); i++) {
                TrackedProductDocument.PricePointDocument previous = history.get(i - 1);
                TrackedProductDocument.PricePointDocument current = history.get(i);
                if (previous.getPrice().compareTo(current.getPrice()) <= 0 || current.getDate() == null) {
                    continue;
                }
                YearMonth month = YearMonth.from(current.getDate().atZone(ZoneOffset.UTC));
                byMonth.merge(month, previous.getPrice().subtract(current.getPrice()), BigDecimal::add);
            }
        }

        YearMonth now = YearMonth.now(ZoneOffset.UTC);
        List<PriceDropChartPoint> chart = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth month = now.minusMonths(i);
            BigDecimal amount = byMonth.getOrDefault(month, BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
            chart.add(new PriceDropChartPoint(month.getMonthValue(), month.getYear(), amount));
        }
        return chart;
    }
}
