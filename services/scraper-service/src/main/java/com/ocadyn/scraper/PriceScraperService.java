package com.ocadyn.scraper;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.util.MarketplaceDetector;
import com.ocadyn.common.util.SupportedMarketplaces;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class PriceScraperService {

    private final PageFetcher pageFetcher;
    private final AmazonHtmlParser amazonHtmlParser;
    private final TrendyolHtmlParser trendyolHtmlParser;
    private final N11HtmlParser n11HtmlParser;
    private final WalmartHtmlParser walmartHtmlParser;

    public PriceScraperService(
            PageFetcher pageFetcher,
            AmazonHtmlParser amazonHtmlParser,
            TrendyolHtmlParser trendyolHtmlParser,
            N11HtmlParser n11HtmlParser,
            WalmartHtmlParser walmartHtmlParser
    ) {
        this.pageFetcher = pageFetcher;
        this.amazonHtmlParser = amazonHtmlParser;
        this.trendyolHtmlParser = trendyolHtmlParser;
        this.n11HtmlParser = n11HtmlParser;
        this.walmartHtmlParser = walmartHtmlParser;
    }

    public ScrapeResult scrape(String url) {
        Marketplace marketplace = MarketplaceDetector.detect(url);
        if (!SupportedMarketplaces.isSupported(marketplace)) {
            throw new ScrapeException(SupportedMarketplaces.unsupportedMessage());
        }

        String html = pageFetcher.fetch(url);

        Optional<ScrapeResult> parsed = switch (marketplace) {
            case AMAZON -> amazonHtmlParser.parse(html, url, marketplace);
            case TRENDYOL -> trendyolHtmlParser.parse(html, url, marketplace);
            case N11 -> n11HtmlParser.parse(html, url, marketplace);
            case WALMART -> walmartHtmlParser.parse(html, url, marketplace);
            default -> Optional.empty();
        };

        return parsed.orElseThrow(() -> new ScrapeException(
                "Could not extract product details from " + marketplace.name() + " page"
        ));
    }

    public BigDecimal refreshPrice(String url, BigDecimal currentPrice) {
        return scrape(url).price();
    }

    public record ScrapeResult(
            String title,
            String image,
            Marketplace marketplace,
            BigDecimal price,
            String currency
    ) {}
}
