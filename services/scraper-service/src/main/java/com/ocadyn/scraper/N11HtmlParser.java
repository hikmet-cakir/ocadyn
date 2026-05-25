package com.ocadyn.scraper;

import com.ocadyn.common.Marketplace;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class N11HtmlParser {

    private final ScrapeParserUtils parserUtils;

    public N11HtmlParser(ScrapeParserUtils parserUtils) {
        this.parserUtils = parserUtils;
    }

    public Optional<PriceScraperService.ScrapeResult> parse(String html, String url, Marketplace marketplace) {
        Optional<PriceScraperService.ScrapeResult> model = parserUtils.parseEmbeddedObject(
                html,
                "window.model = ",
                null,
                url,
                marketplace
        );
        if (model.isPresent()) {
            return model;
        }

        Document document = Jsoup.parse(html, url);
        return parserUtils.parseOpenGraph(document, url, marketplace);
    }
}
