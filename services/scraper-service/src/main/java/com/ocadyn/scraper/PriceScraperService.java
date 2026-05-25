package com.ocadyn.scraper;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.util.MarketplaceDetector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PriceScraperService {

    private static final Logger log = LoggerFactory.getLogger(PriceScraperService.class);

    private final PageFetcher pageFetcher;
    private final AmazonHtmlParser amazonHtmlParser;

    public PriceScraperService(PageFetcher pageFetcher, AmazonHtmlParser amazonHtmlParser) {
        this.pageFetcher = pageFetcher;
        this.amazonHtmlParser = amazonHtmlParser;
    }

    public ScrapeResult scrape(String url) {
        Marketplace marketplace = MarketplaceDetector.detect(url);

        if (marketplace == Marketplace.AMAZON) {
            String html = pageFetcher.fetch(url);
            return amazonHtmlParser.parse(html, url, marketplace)
                    .orElseThrow(() -> new ScrapeException("Could not extract product details from Amazon page"));
        }

        throw new ScrapeException("Real scraping is currently supported for Amazon URLs only");
    }

    public BigDecimal refreshPrice(String url, BigDecimal currentPrice) {
        ScrapeResult scraped = scrape(url);
        return scraped.price();
    }

    public record ScrapeResult(
            String title,
            String image,
            Marketplace marketplace,
            BigDecimal price,
            String currency
    ) {}
}
