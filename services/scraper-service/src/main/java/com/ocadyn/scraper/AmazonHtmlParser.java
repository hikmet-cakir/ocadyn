package com.ocadyn.scraper;

import com.ocadyn.common.Marketplace;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.net.URI;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AmazonHtmlParser {

    private static final Pattern PRICE_AMOUNT_INPUT = Pattern.compile(
            "customerVisiblePrice\\]\\[amount\"\\s+value=\"([0-9.,]+)\""
    );
    private static final Pattern PRICE_CURRENCY_INPUT = Pattern.compile(
            "customerVisiblePrice\\]\\[currencyCode\"\\s+value=\"([A-Z]{3})\""
    );

    public Optional<PriceScraperService.ScrapeResult> parse(String html, String url, Marketplace marketplace) {
        Document document = Jsoup.parse(html, url);

        String title = firstNonBlank(
                text(document.selectFirst("#productTitle")),
                metaContent(document, "og:title"),
                metaContent(document, "title"),
                imageAlt(document),
                titleFromUrl(url)
        );
        if (title != null) {
            title = cleanAmazonTitle(title);
        }

        BigDecimal price = priceFromInputs(document, html);
        String currency = currencyFromInputs(document, html, url);

        String image = firstNonBlank(
                imageSrc(document.selectFirst("#landingImage")),
                imageSrc(document.selectFirst("#imgTagWrapperId img")),
                metaContent(document, "og:image")
        );

        if (title == null || title.isBlank()) {
            return Optional.empty();
        }
        if (price == null) {
            return Optional.empty();
        }
        if (image == null || image.isBlank()) {
            image = "https://via.placeholder.com/400x400?text=Product";
        }

        return Optional.of(new PriceScraperService.ScrapeResult(title, image, marketplace, price, currency));
    }

    private BigDecimal priceFromInputs(Document document, String html) {
        Element amountInput = document.selectFirst("input[name=items[0.base][customerVisiblePrice][amount]]");
        if (amountInput != null) {
            return parseAmount(amountInput.attr("value"));
        }

        Matcher matcher = PRICE_AMOUNT_INPUT.matcher(html);
        if (matcher.find()) {
            return parseAmount(matcher.group(1));
        }

        Element offscreen = document.selectFirst("span.a-price span.a-offscreen");
        if (offscreen != null) {
            return parseLocalizedAmount(offscreen.text());
        }

        return null;
    }

    private String currencyFromInputs(Document document, String html, String url) {
        Element currencyInput = document.selectFirst("input[name=items[0.base][customerVisiblePrice][currencyCode]]");
        if (currencyInput != null && !currencyInput.attr("value").isBlank()) {
            return currencyInput.attr("value");
        }

        Matcher matcher = PRICE_CURRENCY_INPUT.matcher(html);
        if (matcher.find()) {
            return matcher.group(1);
        }

        return inferCurrencyFromHost(url);
    }

    private BigDecimal parseAmount(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String normalized = raw.trim().replace(" ", "");
        if (normalized.contains(",") && normalized.contains(".")) {
            normalized = normalized.replace(".", "").replace(',', '.');
        } else if (normalized.contains(",")) {
            normalized = normalized.replace(',', '.');
        }
        try {
            return new BigDecimal(normalized);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private BigDecimal parseLocalizedAmount(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String digits = raw.replaceAll("[^0-9,.]", "").trim();
        return parseAmount(digits);
    }

    private String cleanAmazonTitle(String title) {
        String cleaned = title.trim();
        int amazonIndex = cleaned.indexOf(": Amazon");
        if (amazonIndex > 0) {
            cleaned = cleaned.substring(0, amazonIndex).trim();
        }
        return cleaned;
    }

    private String titleFromUrl(String url) {
        try {
            URI uri = URI.create(url.trim());
            String path = uri.getPath() == null ? "" : uri.getPath();
            int dpIndex = path.indexOf("/dp/");
            if (dpIndex > 1) {
                String slug = path.substring(1, dpIndex).replace('-', ' ').replace('_', ' ').trim();
                if (!slug.isBlank()) {
                    return capitalizeWords(slug);
                }
            }
        } catch (Exception ignored) {
            // fall through
        }
        return null;
    }

    private String inferCurrencyFromHost(String url) {
        try {
            String host = URI.create(url.trim()).getHost().toLowerCase(Locale.ROOT);
            if (host == null) {
                return "USD";
            }
            if (host.endsWith(".com.tr") || host.contains("trendyol") || host.contains("hepsiburada")
                    || host.contains("n11") || host.contains("sahibinden")) {
                return "TRY";
            }
            if (host.endsWith(".de") || host.endsWith(".fr") || host.endsWith(".it") || host.endsWith(".es")) {
                return "EUR";
            }
            if (host.endsWith(".co.uk")) {
                return "GBP";
            }
            if (host.endsWith(".co.jp")) {
                return "JPY";
            }
        } catch (Exception ignored) {
            // fall through
        }
        return "USD";
    }

    private String capitalizeWords(String value) {
        String[] parts = value.split("\\s+");
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }
            if (!builder.isEmpty()) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(part.charAt(0)));
            if (part.length() > 1) {
                builder.append(part.substring(1));
            }
        }
        return builder.toString();
    }

    private String text(Element element) {
        return element == null ? null : element.text().trim();
    }

    private String metaContent(Document document, String key) {
        Element meta = document.selectFirst("meta[name=" + key + "], meta[property=" + key + "]");
        return meta == null ? null : meta.attr("content").trim();
    }

    private String imageAlt(Document document) {
        Element image = document.selectFirst("#landingImage");
        return image == null ? null : image.attr("alt").trim();
    }

    private String imageSrc(Element image) {
        if (image == null) {
            return null;
        }
        String hires = image.attr("data-old-hires");
        if (!hires.isBlank()) {
            return hires;
        }
        String src = image.attr("src");
        return src.isBlank() ? null : src;
    }

    @SafeVarargs
    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
