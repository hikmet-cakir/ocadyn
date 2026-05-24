package com.ocadyn.report.model;

import com.ocadyn.common.Marketplace;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tracked_products")
public class TrackedProductDocument {

    @Id
    private String id;
    private String userId;
    private Marketplace marketplace;
    private BigDecimal currentPrice = BigDecimal.ZERO;
    private BigDecimal highestPrice = BigDecimal.ZERO;
    private List<PricePointDocument> priceHistory = new ArrayList<>();

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public Marketplace getMarketplace() {
        return marketplace;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public BigDecimal getHighestPrice() {
        return highestPrice;
    }

    public List<PricePointDocument> getPriceHistory() {
        return priceHistory;
    }

    public static class PricePointDocument {
        private Instant date;
        private BigDecimal price;

        public Instant getDate() {
            return date;
        }

        public BigDecimal getPrice() {
            return price;
        }
    }
}
