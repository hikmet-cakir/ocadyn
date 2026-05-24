package com.ocadyn.product;

import java.math.BigDecimal;

public class TriggerSettings {
    private BigDecimal percentDrop;
    private BigDecimal percentRise;
    private BigDecimal fixedDrop;
    private BigDecimal fixedRise;

    public BigDecimal getPercentDrop() {
        return percentDrop;
    }

    public void setPercentDrop(BigDecimal percentDrop) {
        this.percentDrop = percentDrop;
    }

    public BigDecimal getPercentRise() {
        return percentRise;
    }

    public void setPercentRise(BigDecimal percentRise) {
        this.percentRise = percentRise;
    }

    public BigDecimal getFixedDrop() {
        return fixedDrop;
    }

    public void setFixedDrop(BigDecimal fixedDrop) {
        this.fixedDrop = fixedDrop;
    }

    public BigDecimal getFixedRise() {
        return fixedRise;
    }

    public void setFixedRise(BigDecimal fixedRise) {
        this.fixedRise = fixedRise;
    }
}
