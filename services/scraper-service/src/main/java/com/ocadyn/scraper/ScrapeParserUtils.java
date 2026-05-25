package com.ocadyn.scraper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ScrapeParserUtils {

    private static final Pattern SCRIPT_JSON_LD = Pattern.compile(
            "<script[^>]*type=\"application/ld\\+json\"[^>]*>([\\s\\S]*?)</script>",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern CURRENT_PRICE = Pattern.compile(
            "\"currentPrice\"\\s*:\\s*\\{\\s*\"price\"\\s*:\\s*([0-9.]+)"
    );
    private static final Pattern PRICE_STRING_BLOCK = Pattern.compile(
            "\"price\"\\s*:\\s*([0-9.]+)\\s*,\\s*\"priceString\""
    );

    private final ObjectMapper objectMapper;

    public ScrapeParserUtils(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Optional<PriceScraperService.ScrapeResult> parseJsonLdBlocks(
            String html,
            String url,
            com.ocadyn.common.Marketplace marketplace
    ) {
        Matcher matcher = SCRIPT_JSON_LD.matcher(html);
        while (matcher.find()) {
            Optional<PriceScraperService.ScrapeResult> parsed = parseJsonLdNode(matcher.group(1), url, marketplace);
            if (parsed.isPresent()) {
                return parsed;
            }
        }
        return Optional.empty();
    }

    public Optional<PriceScraperService.ScrapeResult> parseJsonLdNode(
            String json,
            String url,
            com.ocadyn.common.Marketplace marketplace
    ) {
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.isArray()) {
                for (JsonNode node : root) {
                    Optional<PriceScraperService.ScrapeResult> parsed = fromProductNode(node, url, marketplace);
                    if (parsed.isPresent()) {
                        return parsed;
                    }
                }
                return Optional.empty();
            }
            return fromProductNode(root, url, marketplace);
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    public Optional<PriceScraperService.ScrapeResult> parseOpenGraph(
            Document document,
            String url,
            com.ocadyn.common.Marketplace marketplace
    ) {
        String title = cleanTitle(metaContent(document, "og:title"), marketplace);
        String image = metaContent(document, "og:image");
        BigDecimal price = parseLocalizedAmount(metaContent(document, "product:price:amount"));
        String currency = metaContent(document, "product:price:currency");
        if (currency == null || currency.isBlank()) {
            currency = inferCurrencyFromHost(url);
        }
        if (title == null || title.isBlank() || price == null) {
            return Optional.empty();
        }
        return Optional.of(buildResult(title, image, marketplace, price, currency, url));
    }

    public Optional<PriceScraperService.ScrapeResult> parseEmbeddedObject(
            String html,
            String marker,
            String objectKey,
            String url,
            com.ocadyn.common.Marketplace marketplace
    ) {
        int startIndex = html.indexOf(marker);
        if (startIndex < 0) {
            return Optional.empty();
        }
        int jsonStart = startIndex + marker.length();
        int jsonEnd = findMatchingBraceEnd(html, jsonStart);
        if (jsonEnd <= jsonStart) {
            return Optional.empty();
        }
        try {
            JsonNode root = objectMapper.readTree(html.substring(jsonStart, jsonEnd));
            JsonNode node = objectKey == null ? root : root.path(objectKey);
            if (node.isMissingNode() || node.isNull()) {
                return Optional.empty();
            }
            return fromGenericProductJson(node, url, marketplace);
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    public Optional<PriceScraperService.ScrapeResult> parseWalmartEmbeddedPrice(
            String html,
            String url,
            com.ocadyn.common.Marketplace marketplace
    ) {
        Document document = org.jsoup.Jsoup.parse(html, url);
        String title = cleanTitle(firstNonBlank(
                metaContent(document, "og:title"),
                text(document.selectFirst("h1"))
        ), marketplace);
        String image = metaContent(document, "og:image");

        BigDecimal price = null;
        Matcher current = CURRENT_PRICE.matcher(html);
        if (current.find()) {
            price = parseAmount(current.group(1));
        }
        if (price == null) {
            Matcher fallback = PRICE_STRING_BLOCK.matcher(html);
            if (fallback.find()) {
                price = parseAmount(fallback.group(1));
            }
        }
        if (title == null || title.isBlank() || price == null) {
            return Optional.empty();
        }
        return Optional.of(buildResult(title, image, marketplace, price, "USD", url));
    }

    public String titleFromSlug(String url, String... stopSegments) {
        try {
            java.net.URI uri = java.net.URI.create(url.trim());
            String path = uri.getPath() == null ? "" : uri.getPath();
            String slug = path;
            for (String stop : stopSegments) {
                int index = slug.indexOf(stop);
                if (index > 0) {
                    slug = slug.substring(0, index);
                }
            }
            slug = slug.replaceAll("^/|/$", "");
            if (slug.contains("/")) {
                slug = slug.substring(slug.lastIndexOf('/') + 1);
            }
            slug = slug.replace('-', ' ').replace('_', ' ').trim();
            if (slug.isBlank()) {
                return null;
            }
            return capitalizeWords(slug);
        } catch (Exception ignored) {
            return null;
        }
    }

    public BigDecimal parseAmount(String raw) {
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

    public BigDecimal parseLocalizedAmount(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String digits = raw.replaceAll("[^0-9,.]", "").trim();
        return parseAmount(digits);
    }

    public String inferCurrencyFromHost(String url) {
        try {
            String host = java.net.URI.create(url.trim()).getHost().toLowerCase(Locale.ROOT);
            if (host == null) {
                return "USD";
            }
            if (host.endsWith(".com.tr") || host.contains("trendyol") || host.contains("n11")) {
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

    public String normalizeImageUrl(String image, String fallbackSizeToken) {
        if (image == null || image.isBlank()) {
            return null;
        }
        if (image.contains("{0}") && fallbackSizeToken != null) {
            return image.replace("{0}", fallbackSizeToken);
        }
        return image;
    }

    public PriceScraperService.ScrapeResult buildResult(
            String title,
            String image,
            com.ocadyn.common.Marketplace marketplace,
            BigDecimal price,
            String currency,
            String url
    ) {
        String resolvedImage = image;
        if (resolvedImage == null || resolvedImage.isBlank()) {
            resolvedImage = "https://via.placeholder.com/400x400?text=Product";
        }
        String resolvedCurrency = (currency == null || currency.isBlank())
                ? inferCurrencyFromHost(url)
                : currency;
        return new PriceScraperService.ScrapeResult(title.trim(), resolvedImage, marketplace, price, resolvedCurrency);
    }

    public String cleanTitle(String title, com.ocadyn.common.Marketplace marketplace) {
        if (title == null) {
            return null;
        }
        String cleaned = title.trim();
        cleaned = cleaned.replaceAll("\\s+-\\s+Fiyatı, Yorumları$", "");
        cleaned = cleaned.replaceAll("\\s+-\\s+Walmart\\.com$", "");
        cleaned = cleaned.replaceAll("\\s+-\\s+n11\\.com$", "");
        if (marketplace == com.ocadyn.common.Marketplace.AMAZON) {
            int amazonIndex = cleaned.indexOf(": Amazon");
            if (amazonIndex > 0) {
                cleaned = cleaned.substring(0, amazonIndex).trim();
            }
        }
        return cleaned;
    }

    private Optional<PriceScraperService.ScrapeResult> fromProductNode(
            JsonNode node,
            String url,
            com.ocadyn.common.Marketplace marketplace
    ) {
        if (node == null || node.isNull()) {
            return Optional.empty();
        }
        String type = node.path("@type").asText("");
        if ("ProductGroup".equals(type) || "Product".equals(type) || node.has("offers") || node.has("name")) {
            return fromGenericProductJson(node, url, marketplace);
        }
        return Optional.empty();
    }

    private Optional<PriceScraperService.ScrapeResult> fromGenericProductJson(
            JsonNode node,
            String url,
            com.ocadyn.common.Marketplace marketplace
    ) {
        String title = firstNonBlank(
                text(node, "name"),
                text(node, "title"),
                text(node.path("product"), "title")
        );
        title = cleanTitle(title, marketplace);

        JsonNode offers = node.path("offers");
        if (offers.isMissingNode()) {
            offers = node.path("product").path("offers");
        }
        BigDecimal price = extractOfferPrice(offers);
        String currency = extractOfferCurrency(offers, url);
        String image = extractImage(node);

        if (marketplace == com.ocadyn.common.Marketplace.N11 && node.has("product")) {
            JsonNode product = node.path("product");
            if (title == null) {
                title = cleanTitle(text(product, "title"), marketplace);
            }
            if (price == null) {
                price = parseLocalizedAmount(text(product, "price"));
            }
            if (price == null) {
                price = parseAmount(text(node.path("productMeta"), "price"));
            }
            if (image == null) {
                image = normalizeImageUrl(text(product.path("image"), "path"), "org");
            }
        }

        if (title == null || title.isBlank() || price == null) {
            return Optional.empty();
        }
        return Optional.of(buildResult(title, image, marketplace, price, currency, url));
    }

    private BigDecimal extractOfferPrice(JsonNode offers) {
        if (offers.isMissingNode() || offers.isNull()) {
            return null;
        }
        if (offers.isArray()) {
            for (JsonNode offer : offers) {
                BigDecimal price = parseAmount(text(offer, "price"));
                if (price != null) {
                    return price;
                }
            }
            return null;
        }
        BigDecimal lowPrice = parseAmount(text(offers, "lowPrice"));
        if (lowPrice != null) {
            return lowPrice;
        }
        return parseAmount(text(offers, "price"));
    }

    private String extractOfferCurrency(JsonNode offers, String url) {
        if (!offers.isMissingNode() && !offers.isNull()) {
            if (offers.isArray()) {
                for (JsonNode offer : offers) {
                    String currency = text(offer, "priceCurrency");
                    if (currency != null) {
                        return currency;
                    }
                }
            } else {
                String currency = text(offers, "priceCurrency");
                if (currency != null) {
                    return currency;
                }
            }
        }
        return inferCurrencyFromHost(url);
    }

    private String extractImage(JsonNode node) {
        JsonNode image = node.path("image");
        if (image.isTextual()) {
            return image.asText();
        }
        if (image.isObject()) {
            JsonNode contentUrl = image.path("contentUrl");
            if (contentUrl.isArray() && contentUrl.size() > 0) {
                return contentUrl.get(0).asText();
            }
            if (contentUrl.isTextual()) {
                return contentUrl.asText();
            }
        }
        if (image.isArray() && image.size() > 0) {
            JsonNode first = image.get(0);
            if (first.isTextual()) {
                return first.asText();
            }
            return text(first, "url");
        }
        return null;
    }

    private int findMatchingBraceEnd(String html, int start) {
        int depth = 0;
        for (int i = start; i < html.length(); i++) {
            char ch = html.charAt(i);
            if (ch == '{') {
                depth++;
            } else if (ch == '}') {
                depth--;
                if (depth == 0) {
                    return i + 1;
                }
            }
        }
        return -1;
    }

    public String metaContent(Document document, String key) {
        Element meta = document.selectFirst("meta[name=" + key + "], meta[property=" + key + "]");
        return meta == null ? null : meta.attr("content").trim();
    }

    public String text(Element element) {
        return element == null ? null : element.text().trim();
    }

    private String text(JsonNode node, String field) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        JsonNode value = node.path(field);
        if (value.isMissingNode() || value.isNull()) {
            return null;
        }
        String text = value.asText(null);
        return text == null || text.isBlank() ? null : text.trim();
    }

    public String capitalizeWords(String value) {
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

    @SafeVarargs
    public final String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
