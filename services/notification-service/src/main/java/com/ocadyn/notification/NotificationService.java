package com.ocadyn.notification;

import com.ocadyn.common.NotificationType;
import com.ocadyn.common.exception.ApiException;
import com.ocadyn.internal.dto.CreatePriceChangeNotificationRequest;
import com.ocadyn.notification.dto.NotificationResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class NotificationService {

    private final AppNotificationRepository notificationRepository;

    public NotificationService(AppNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> list(String userId, NotificationType type) {
        List<AppNotification> items = type == null
                ? notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
        return items.stream().map(this::toResponse).toList();
    }

    public void markRead(String userId, String notificationId) {
        AppNotification notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getUserId().equals(userId))
                .orElseThrow(() -> new ApiException(404, "Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllRead(String userId) {
        List<AppNotification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.isRead())
                .toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public long countUnread(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void createPriceChangeNotification(CreatePriceChangeNotificationRequest request) {
        BigDecimal previous = request.previousPrice();
        BigDecimal next = request.currentPrice();
        NotificationType type = request.type() != null
                ? request.type()
                : (next.compareTo(previous) < 0 ? NotificationType.PRICE_DROP : NotificationType.PRICE_INCREASE);

        String message = request.message();
        if (message == null || message.isBlank()) {
            if (previous.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percent = next.subtract(previous)
                        .divide(previous, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .abs()
                        .setScale(1, RoundingMode.HALF_UP);
                message = type == NotificationType.PRICE_DROP
                        ? "Price dropped by " + percent + "%"
                        : "Price increased by " + percent + "%";
            } else {
                message = "Price update: " + next + " " + request.currency();
            }
        }

        AppNotification notification = new AppNotification();
        notification.setUserId(request.userId());
        notification.setProductId(request.productId());
        notification.setProductTitle(request.productTitle());
        notification.setProductImage(request.productImage());
        notification.setMarketplace(request.marketplace());
        notification.setType(type);
        notification.setMessage(message);
        notification.setPreviousPrice(previous);
        notification.setCurrentPrice(next);
        notification.setCurrency(request.currency());
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    private NotificationResponse toResponse(AppNotification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getProductId(),
                notification.getProductTitle(),
                notification.getProductImage(),
                notification.getMarketplace(),
                notification.getType(),
                notification.getMessage(),
                notification.getPreviousPrice(),
                notification.getCurrentPrice(),
                notification.getCurrency(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
