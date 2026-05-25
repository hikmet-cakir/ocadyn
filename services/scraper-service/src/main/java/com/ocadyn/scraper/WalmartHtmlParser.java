package com.ocadyn.scraper;

import com.ocadyn.common.Marketplace;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class WalmartHtmlParser {

    private final ScrapeParserUtils parserUtils;

    public WalmartHtmlParser(ScrapeParserUtils parserUtils) {
        this.parserUtils = parserUtils;
    }

    public Optional<PriceScraperService.ScrapeResult> parse(String html, String url, Marketplace marketplace) {
        Optional<PriceScraperService.ScrapeResult> embedded = parserUtils.parseWalmartEmbeddedPrice(html, url, marketplace);
        if (embedded.isPresent()) {
            return embedded;
        }
        return parserUtils.parseJsonLdBlocks(html, url, marketplace);
    }
}
