package com.ocadyn.product;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.TrackingStatus;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tracked_products")
@CompoundIndex(name = "user_url_idx", def = "{'userId': 1, 'url': 1}", unique = true)
public class TrackedProduct {

    @Id
    private String id;

    private String userId;

    private String title;

    private String image;

    private String url;

    private Marketplace marketplace;

    private BigDecimal currentPrice = BigDecimal.ZERO;

    private BigDecimal lowestPrice = BigDecimal.ZERO;

    private BigDecimal highestPrice = BigDecimal.ZERO;

    private String currency = "USD";

    private BigDecimal changePercent = BigDecimal.ZERO;

    private List<PricePoint> priceHistory = new ArrayList<>();

    private NotificationSettings notificationSettings = new NotificationSettings();

    private TrackingStatus trackingStatus = TrackingStatus.ACTIVE;

    private boolean favorite;

    private Instant lastPriceCheckAt;

    private Instant lastNotificationAt;

    @LastModifiedDate
    private Instant lastUpdated;

    @CreatedDate
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Marketplace getMarketplace() {
        return marketplace;
    }

    public void setMarketplace(Marketplace marketplace) {
        this.marketplace = marketplace;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public BigDecimal getLowestPrice() {
        return lowestPrice;
    }

    public void setLowestPrice(BigDecimal lowestPrice) {
        this.lowestPrice = lowestPrice;
    }

    public BigDecimal getHighestPrice() {
        return highestPrice;
    }

    public void setHighestPrice(BigDecimal highestPrice) {
        this.highestPrice = highestPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getChangePercent() {
        return changePercent;
    }

    public void setChangePercent(BigDecimal changePercent) {
        this.changePercent = changePercent;
    }

    public List<PricePoint> getPriceHistory() {
        return priceHistory;
    }

    public void setPriceHistory(List<PricePoint> priceHistory) {
        this.priceHistory = priceHistory;
    }

    public NotificationSettings getNotificationSettings() {
        return notificationSettings;
    }

    public void setNotificationSettings(NotificationSettings notificationSettings) {
        this.notificationSettings = notificationSettings;
    }

    public TrackingStatus getTrackingStatus() {
        return trackingStatus;
    }

    public void setTrackingStatus(TrackingStatus trackingStatus) {
        this.trackingStatus = trackingStatus;
    }

    public boolean isFavorite() {
        return favorite;
    }

    public void setFavorite(boolean favorite) {
        this.favorite = favorite;
    }

    public Instant getLastPriceCheckAt() {
        return lastPriceCheckAt;
    }

    public void setLastPriceCheckAt(Instant lastPriceCheckAt) {
        this.lastPriceCheckAt = lastPriceCheckAt;
    }

    public Instant getLastNotificationAt() {
        return lastNotificationAt;
    }

    public void setLastNotificationAt(Instant lastNotificationAt) {
        this.lastNotificationAt = lastNotificationAt;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
