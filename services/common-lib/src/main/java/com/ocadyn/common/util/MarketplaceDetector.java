package com.ocadyn.common.util;

import com.ocadyn.common.Marketplace;

import java.net.URI;
import java.util.Locale;

public final class MarketplaceDetector {

    private MarketplaceDetector() {}

    public static Marketplace detect(String url) {
        if (url == null || url.isBlank()) {
            return Marketplace.OTHER;
        }
        String host = URI.create(url.trim()).getHost();
        if (host == null) {
            return Marketplace.OTHER;
        }
        String lower = host.toLowerCase(Locale.ROOT);
        if (lower.contains("amazon")) return Marketplace.AMAZON;
        if (lower.contains("trendyol")) return Marketplace.TRENDYOL;
        if (lower.contains("hepsiburada")) return Marketplace.HEPSIBURADA;
        if (lower.contains("n11")) return Marketplace.N11;
        if (lower.contains("walmart")) return Marketplace.WALMART;
        if (lower.contains("alibaba")) return Marketplace.ALIBABA;
        if (lower.contains("sahibinden")) return Marketplace.SAHIBINDEN;
        return Marketplace.OTHER;
    }
}
