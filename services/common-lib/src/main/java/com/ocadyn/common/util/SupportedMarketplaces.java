package com.ocadyn.common.util;

import com.ocadyn.common.Marketplace;

import java.util.EnumSet;
import java.util.Set;

public final class SupportedMarketplaces {

    private static final Set<Marketplace> SUPPORTED = EnumSet.of(
            Marketplace.AMAZON,
            Marketplace.TRENDYOL,
            Marketplace.N11,
            Marketplace.WALMART
    );

    private SupportedMarketplaces() {}

    public static boolean isSupported(Marketplace marketplace) {
        return SUPPORTED.contains(marketplace);
    }

    public static boolean isSupportedUrl(String url) {
        return isSupported(MarketplaceDetector.detect(url));
    }

    public static String unsupportedMessage() {
        return "This marketplace is not supported. Supported stores: Amazon, Trendyol, N11, Walmart.";
    }
}
