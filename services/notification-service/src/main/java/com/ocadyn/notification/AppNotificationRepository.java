package com.ocadyn.notification;

import com.ocadyn.common.NotificationType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AppNotificationRepository extends MongoRepository<AppNotification, String> {
    List<AppNotification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<AppNotification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, NotificationType type);
    long countByUserId(String userId);
    long countByUserIdAndReadFalse(String userId);
}
