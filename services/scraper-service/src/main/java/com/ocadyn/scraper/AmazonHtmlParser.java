package com.ocadyn.scraper;

import com.ocadyn.common.Marketplace;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
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

    private final ScrapeParserUtils parserUtils;

    public AmazonHtmlParser(ScrapeParserUtils parserUtils) {
        this.parserUtils = parserUtils;
    }

    public Optional<PriceScraperService.ScrapeResult> parse(String html, String url, Marketplace marketplace) {
        Document document = Jsoup.parse(html, url);

        String title = parserUtils.firstNonBlank(
                text(document.selectFirst("#productTitle")),
                parserUtils.metaContent(document, "og:title"),
                parserUtils.metaContent(document, "title"),
                imageAlt(document),
                parserUtils.titleFromSlug(url, "/dp/")
        );
        title = parserUtils.cleanTitle(title, marketplace);

        BigDecimal price = priceFromInputs(document, html);
        String currency = currencyFromInputs(document, html, url);

        String image = parserUtils.firstNonBlank(
                imageSrc(document.selectFirst("#landingImage")),
                imageSrc(document.selectFirst("#imgTagWrapperId img")),
                parserUtils.metaContent(document, "og:image")
        );

        if (title == null || title.isBlank() || price == null) {
            return parserUtils.parseJsonLdBlocks(html, url, marketplace);
        }
        return Optional.of(parserUtils.buildResult(title, image, marketplace, price, currency, url));
    }

    private BigDecimal priceFromInputs(Document document, String html) {
        Element amountInput = document.selectFirst("input[name=items[0.base][customerVisiblePrice][amount]]");
        if (amountInput != null) {
            return parserUtils.parseAmount(amountInput.attr("value"));
        }

        Matcher matcher = PRICE_AMOUNT_INPUT.matcher(html);
        if (matcher.find()) {
            return parserUtils.parseAmount(matcher.group(1));
        }

        Element offscreen = document.selectFirst("span.a-price span.a-offscreen");
        if (offscreen != null) {
            return parserUtils.parseLocalizedAmount(offscreen.text());
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

        return parserUtils.inferCurrencyFromHost(url);
    }

    private String text(Element element) {
        return element == null ? null : element.text().trim();
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
}
