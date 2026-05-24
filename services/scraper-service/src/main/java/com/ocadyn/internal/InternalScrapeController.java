package com.ocadyn.internal;

import com.ocadyn.scraper.PriceScraperService;
import com.ocadyn.scraper.PriceScraperService.ScrapeResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/scrape")
public class InternalScrapeController {

    private final PriceScraperService priceScraperService;

    public InternalScrapeController(PriceScraperService priceScraperService) {
        this.priceScraperService = priceScraperService;
    }

    @PostMapping
    public ScrapeResult scrape(@RequestBody ScrapeRequest request) {
        return priceScraperService.scrape(request.url());
    }

    public record ScrapeRequest(String url) {}
}
