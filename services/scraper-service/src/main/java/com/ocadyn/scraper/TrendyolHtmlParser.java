package com.ocadyn.scraper;

import com.ocadyn.common.Marketplace;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
public class TrendyolHtmlParser {

    private final ScrapeParserUtils parserUtils;

    public TrendyolHtmlParser(ScrapeParserUtils parserUtils) {
        this.parserUtils = parserUtils;
    }

    public Optional<PriceScraperService.ScrapeResult> parse(String html, String url, Marketplace marketplace) {
        Optional<PriceScraperService.ScrapeResult> jsonLd = parserUtils.parseJsonLdBlocks(html, url, marketplace);
        if (jsonLd.isPresent()) {
            return jsonLd;
        }

        Document document = Jsoup.parse(html, url);
        String title = parserUtils.cleanTitle(parserUtils.firstNonBlank(
                parserUtils.metaContent(document, "og:title"),
                text(document.selectFirst("h1"))
        ), marketplace);
        BigDecimal price = parserUtils.parseLocalizedAmount(text(document.selectFirst("[data-testid=price]")));
        String image = parserUtils.metaContent(document, "og:image");

        if (title == null || price == null) {
            return Optional.empty();
        }
        return Optional.of(parserUtils.buildResult(title, image, marketplace, price, "TRY", url));
    }

    private String text(Element element) {
        return element == null ? null : element.text().trim();
    }
}
