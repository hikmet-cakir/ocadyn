package com.ocadyn.common.util;

import com.ocadyn.common.Marketplace;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MarketplaceUtilsTest {

    @Test
    void detect_shouldResolveKnownMarketplaces() {
        assertEquals(Marketplace.AMAZON, MarketplaceDetector.detect("https://www.amazon.com/product/1"));
        assertEquals(Marketplace.TRENDYOL, MarketplaceDetector.detect("https://trendyol.com/item"));
        assertEquals(Marketplace.N11, MarketplaceDetector.detect("https://www.n11.com/urun"));
        assertEquals(Marketplace.WALMART, MarketplaceDetector.detect("https://www.walmart.com/ip/1"));
    }

    @Test
    void detect_shouldReturnOther_forUnknownOrBlank() {
        assertEquals(Marketplace.OTHER, MarketplaceDetector.detect(null));
        assertEquals(Marketplace.OTHER, MarketplaceDetector.detect(" "));
        assertEquals(Marketplace.OTHER, MarketplaceDetector.detect("https://example.com/product"));
    }

    @Test
    void supportedMarketplaces_shouldValidateMarketplaceAndUrl() {
        assertTrue(SupportedMarketplaces.isSupported(Marketplace.AMAZON));
        assertFalse(SupportedMarketplaces.isSupported(Marketplace.OTHER));
        assertTrue(SupportedMarketplaces.isSupportedUrl("https://www.walmart.com/ip/1"));
        assertFalse(SupportedMarketplaces.isSupportedUrl("https://unsupported.store/item"));
        assertTrue(SupportedMarketplaces.unsupportedMessage().contains("Supported stores"));
    }
}
