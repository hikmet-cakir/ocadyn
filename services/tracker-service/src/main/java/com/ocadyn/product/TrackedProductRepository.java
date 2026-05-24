package com.ocadyn.product;

import com.ocadyn.common.TrackingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TrackedProductRepository extends MongoRepository<TrackedProduct, String> {
    List<TrackedProduct> findByUserIdOrderByCreatedAtDesc(String userId);
    List<TrackedProduct> findByUserIdAndTrackingStatusOrderByCreatedAtDesc(String userId, TrackingStatus status);
    List<TrackedProduct> findByUserIdAndFavoriteTrueOrderByCreatedAtDesc(String userId);
    List<TrackedProduct> findByTrackingStatusOrderByCreatedAtDesc(TrackingStatus trackingStatus);
    Optional<TrackedProduct> findByIdAndUserId(String id, String userId);
    Optional<TrackedProduct> findByUserIdAndUrl(String userId, String url);
    long countByUserId(String userId);
}
