package com.ocadyn.scraper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Component
public class PageFetcher {

    private static final Logger log = LoggerFactory.getLogger(PageFetcher.class);

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public String fetch(String url) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(url.trim()))
                    .timeout(Duration.ofSeconds(30))
                    .header("User-Agent", USER_AGENT)
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                    .header("Accept-Language", "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7")
                    .GET();

            String referer = refererFor(url);
            if (referer != null) {
                builder.header("Referer", referer);
            }

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new ScrapeException("Store returned HTTP " + response.statusCode());
            }
            String body = response.body();
            if (body == null || body.isBlank()) {
                throw new ScrapeException("Store returned an empty page");
            }
            if (looksLikeBotChallenge(body, url)) {
                throw new ScrapeException("Store blocked automated access. Try again later.");
            }
            return body;
        } catch (ScrapeException ex) {
            throw ex;
        } catch (IOException ex) {
            log.warn("Failed to fetch product page: {}", url, ex);
            throw new ScrapeException("Could not reach product page");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ScrapeException("Could not reach product page");
        }
    }

    private String refererFor(String url) {
        try {
            URI uri = URI.create(url.trim());
            if (uri.getScheme() == null || uri.getHost() == null) {
                return null;
            }
            return uri.getScheme() + "://" + uri.getHost() + "/";
        } catch (Exception ex) {
            return null;
        }
    }

    private boolean looksLikeBotChallenge(String html, String url) {
        String lower = html.toLowerCase();
        if (lower.contains("robot or human") || lower.contains("validatecaptcha")) {
            return true;
        }
        return lower.contains("alisverise devam etmek icin");
    }
}
