package com.ocadyn.scraper;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.util.MarketplaceDetector;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class PriceScraperService {

    public ScrapeResult scrape(String url) {
        Marketplace marketplace = MarketplaceDetector.detect(url);
        String title = extractTitleFromUrl(url, marketplace);
        BigDecimal price = simulatePrice(marketplace);
        String image = defaultImage(marketplace);
        return new ScrapeResult(title, image, marketplace, price, "USD");
    }

    public BigDecimal simulateNextPrice(BigDecimal current) {
        double swing = ThreadLocalRandom.current().nextDouble(-0.08, 0.08);
        BigDecimal next = current.multiply(BigDecimal.valueOf(1 + swing)).setScale(2, RoundingMode.HALF_UP);
        if (next.compareTo(BigDecimal.ONE) < 0) {
            return BigDecimal.valueOf(9.99);
        }
        return next;
    }

    private String extractTitleFromUrl(String url, Marketplace marketplace) {
        try {
            URI uri = URI.create(url.trim());
            String path = uri.getPath() == null ? "" : uri.getPath();
            String slug = path.substring(path.lastIndexOf('/') + 1).replace('-', ' ').replace('_', ' ');
            if (slug.isBlank()) {
                return marketplace.name() + " product";
            }
            return capitalize(slug);
        } catch (Exception ex) {
            return marketplace.name() + " product";
        }
    }

    private String capitalize(String value) {
        if (value.isBlank()) return value;
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1);
    }

    private BigDecimal simulatePrice(Marketplace marketplace) {
        return switch (marketplace) {
            case AMAZON -> randomBetween(49, 1299);
            case TRENDYOL, HEPSIBURADA, N11 -> randomBetween(99, 8999);
            case WALMART -> randomBetween(29, 799);
            case ALIBABA -> randomBetween(5, 499);
            case SAHIBINDEN -> randomBetween(1000, 500000);
            default -> randomBetween(19, 499);
        };
    }

    private BigDecimal randomBetween(int min, int max) {
        double value = ThreadLocalRandom.current().nextDouble(min, max);
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private String defaultImage(Marketplace marketplace) {
        return switch (marketplace) {
            case AMAZON -> "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";
            case TRENDYOL, HEPSIBURADA -> "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop";
            default -> "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop";
        };
    }

    public record ScrapeResult(
            String title,
            String image,
            Marketplace marketplace,
            BigDecimal price,
            String currency
    ) {}
}
