package com.ocadyn.product;

import java.math.BigDecimal;
import java.time.Instant;

public class PricePoint {
    private Instant date;
    private BigDecimal price;

    public PricePoint() {}

    public PricePoint(Instant date, BigDecimal price) {
        this.date = date;
        this.price = price;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
