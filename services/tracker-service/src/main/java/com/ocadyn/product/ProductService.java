package com.ocadyn.product;

import com.ocadyn.client.ScraperClient;
import com.ocadyn.common.TrackingStatus;
import com.ocadyn.common.dto.ProductNotificationChannelsDto;
import com.ocadyn.common.dto.ProductNotificationSettingsDto;
import com.ocadyn.common.dto.ProductTriggerSettingsDto;
import com.ocadyn.common.exception.ApiException;
import com.ocadyn.common.util.SupportedMarketplaces;
import com.ocadyn.internal.dto.ActiveProductResponse;
import com.ocadyn.internal.dto.PriceUpdateResponse;
import com.ocadyn.product.dto.DashboardStatsResponse;
import com.ocadyn.product.dto.NotificationSettingsResponse;
import com.ocadyn.product.dto.ProductResponse;
import com.ocadyn.product.dto.TrackProductRequest;
import com.ocadyn.product.dto.UpdateNotificationSettingsRequest;
import com.ocadyn.product.dto.UpdateTrackingStatusRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final TrackedProductRepository productRepository;
    private final ScraperClient scraperClient;

    public ProductService(TrackedProductRepository productRepository, ScraperClient scraperClient) {
        this.productRepository = productRepository;
        this.scraperClient = scraperClient;
    }

    public List<ProductResponse> listProducts(String userId, TrackingStatus status, Boolean favorite, String search) {
        List<TrackedProduct> products = resolveList(userId, status, favorite);
        if (search != null && !search.isBlank()) {
            String term = search.toLowerCase();
            products = products.stream()
                    .filter(p -> p.getTitle().toLowerCase().contains(term)
                            || p.getMarketplace().name().toLowerCase().contains(term))
                    .toList();
        }
        return products.stream().map(this::toResponse).toList();
    }

    public ProductResponse getProduct(String userId, String productId) {
        return toResponse(requireOwnedProduct(userId, productId));
    }

    public ProductResponse trackFromUrl(String userId, TrackProductRequest request) {
        String url = request.url().trim();
        if (!SupportedMarketplaces.isSupportedUrl(url)) {
            throw new ApiException(422, SupportedMarketplaces.unsupportedMessage());
        }
        productRepository.findByUserIdAndUrl(userId, url).ifPresent(existing -> {
            throw new ApiException(409, "Product already tracked");
        });

        var scraped = scraperClient.scrape(url);
        TrackedProduct product = new TrackedProduct();
        product.setUserId(userId);
        product.setUrl(url);
        product.setTitle(scraped.title());
        product.setImage(scraped.image());
        product.setMarketplace(scraped.marketplace());
        product.setCurrentPrice(scraped.price());
        product.setLowestPrice(scraped.price());
        product.setHighestPrice(scraped.price());
        product.setCurrency(scraped.currency());
        product.setChangePercent(BigDecimal.ZERO);
        product.setPriceHistory(new ArrayList<>(List.of(new PricePoint(Instant.now(), scraped.price()))));
        product.setTrackingStatus(TrackingStatus.ACTIVE);

        return toResponse(productRepository.save(product));
    }

    public ProductResponse updateTrackingStatus(
            String userId,
            String productId,
            UpdateTrackingStatusRequest request
    ) {
        TrackedProduct product = requireOwnedProduct(userId, productId);
        product.setTrackingStatus(request.trackingStatus());
        return toResponse(productRepository.save(product));
    }

    public ProductResponse toggleFavorite(String userId, String productId, boolean favorite) {
        TrackedProduct product = requireOwnedProduct(userId, productId);
        product.setFavorite(favorite);
        return toResponse(productRepository.save(product));
    }

    public ProductResponse updateNotificationSettings(
            String userId,
            String productId,
            UpdateNotificationSettingsRequest request
    ) {
        if (request.notificationSettings() == null
                || !request.notificationSettings().getChannels().isPush()) {
            throw new ApiException(422, "Push notification selection is required.");
        }
        TrackedProduct product = requireOwnedProduct(userId, productId);
        product.setNotificationSettings(request.notificationSettings());
        return toResponse(productRepository.save(product));
    }

    public DashboardStatsResponse getStats(String userId) {
        List<TrackedProduct> products = productRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long dropped = products.stream().filter(p -> p.getChangePercent().compareTo(BigDecimal.ZERO) < 0).count();
        long increased = products.stream().filter(p -> p.getChangePercent().compareTo(BigDecimal.ZERO) > 0).count();
        long unchanged = products.stream().filter(p -> p.getChangePercent().compareTo(BigDecimal.ZERO) == 0).count();
        return new DashboardStatsResponse(products.size(), dropped, increased, unchanged);
    }

    public List<ActiveProductResponse> listActiveProducts() {
        return productRepository.findByTrackingStatusOrderByCreatedAtDesc(TrackingStatus.ACTIVE).stream()
                .map(p -> new ActiveProductResponse(
                        p.getId(),
                        p.getUserId(),
                        p.getTitle(),
                        p.getImage(),
                        p.getUrl(),
                        p.getMarketplace(),
                        p.getCurrentPrice(),
                        p.getCurrency(),
                        p.getTrackingStatus(),
                        p.getLastPriceCheckAt(),
                        p.getLastNotificationAt(),
                        toNotificationSettingsDto(p.getNotificationSettings())
                ))
                .toList();
    }

    public PriceUpdateResponse applyPriceUpdate(String productId, BigDecimal newPrice) {
        TrackedProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(404, "Product not found"));

        BigDecimal previous = product.getCurrentPrice();
        product.setCurrentPrice(newPrice);
        product.setLowestPrice(product.getLowestPrice().min(newPrice));
        product.setHighestPrice(product.getHighestPrice().max(newPrice));

        if (previous.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal change = newPrice.subtract(previous)
                    .divide(previous, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(1, RoundingMode.HALF_UP);
            product.setChangePercent(change);
        }

        Instant now = Instant.now();
        PriceHistoryUtils.upsertDailyPoint(product.getPriceHistory(), newPrice, now);
        product.setPriceHistory(PriceHistoryUtils.compactByDay(product.getPriceHistory()));
        product.setLastPriceCheckAt(now);
        productRepository.save(product);

        boolean changed = previous.compareTo(newPrice) != 0;
        return new PriceUpdateResponse(
                previous,
                newPrice,
                changed,
                product.getUserId(),
                product.getId(),
                product.getTitle(),
                product.getImage(),
                product.getMarketplace(),
                product.getCurrency()
        );
    }

    private List<TrackedProduct> resolveList(String userId, TrackingStatus status, Boolean favorite) {
        if (Boolean.TRUE.equals(favorite)) {
            return productRepository.findByUserIdAndFavoriteTrueOrderByCreatedAtDesc(userId);
        }
        if (status != null) {
            return productRepository.findByUserIdAndTrackingStatusOrderByCreatedAtDesc(userId, status);
        }
        return productRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private TrackedProduct requireOwnedProduct(String userId, String productId) {
        return productRepository.findByIdAndUserId(productId, userId)
                .orElseThrow(() -> new ApiException(404, "Product not found"));
    }

    public ProductResponse toResponse(TrackedProduct product) {
        NotificationSettings settings = product.getNotificationSettings();
        return new ProductResponse(
                product.getId(),
                product.getTitle(),
                product.getImage(),
                product.getUrl(),
                product.getMarketplace(),
                product.getCurrentPrice(),
                product.getLowestPrice(),
                product.getHighestPrice(),
                product.getCurrency(),
                product.getChangePercent(),
                PriceHistoryUtils.compactByDay(product.getPriceHistory()),
                new NotificationSettingsResponse(
                        settings.getChannels(),
                        settings.getTriggers(),
                        settings.getFrequency(),
                        settings.isInstantAlertsEnabled()
                ),
                product.getTrackingStatus(),
                product.isFavorite(),
                product.getLastUpdated()
        );
    }

    private ProductNotificationSettingsDto toNotificationSettingsDto(NotificationSettings settings) {
        if (settings == null) {
            return null;
        }
        NotificationChannelSettings channels = settings.getChannels();
        TriggerSettings triggers = settings.getTriggers();
        return new ProductNotificationSettingsDto(
                new ProductNotificationChannelsDto(
                        channels.isEmail(),
                        channels.isSms(),
                        channels.isPhone(),
                        channels.isPush()
                ),
                new ProductTriggerSettingsDto(
                        triggers.getPercentDrop(),
                        triggers.getPercentRise(),
                        triggers.getFixedDrop(),
                        triggers.getFixedRise()
                ),
                settings.getFrequency(),
                settings.isInstantAlertsEnabled()
        );
    }

    public void recordPeriodicNotification(String productId) {
        TrackedProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(404, "Product not found"));
        product.setLastNotificationAt(Instant.now());
        productRepository.save(product);
    }
}
