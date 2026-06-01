package com.ocadyn.notification;

import com.ocadyn.common.NotificationType;
import com.ocadyn.common.exception.ApiException;
import com.ocadyn.config.AppProperties;
import com.ocadyn.internal.dto.CreatePriceChangeNotificationRequest;
import com.ocadyn.notification.dto.NotificationResponse;
import com.ocadyn.user.UserContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final AppNotificationRepository notificationRepository;
    private final UserContactRepository userContactRepository;
    private final EmailNotificationSender emailNotificationSender;
    private final EmailTemplateBuilder emailTemplateBuilder;
    private final AppProperties appProperties;

    public NotificationService(
            AppNotificationRepository notificationRepository,
            UserContactRepository userContactRepository,
            EmailNotificationSender emailNotificationSender,
            EmailTemplateBuilder emailTemplateBuilder,
            AppProperties appProperties
    ) {
        this.notificationRepository = notificationRepository;
        this.userContactRepository = userContactRepository;
        this.emailNotificationSender = emailNotificationSender;
        this.emailTemplateBuilder = emailTemplateBuilder;
        this.appProperties = appProperties;
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
                : resolveTypeFromPrices(previous, next);

        BigDecimal percent = BigDecimal.ZERO;
        if (previous.compareTo(BigDecimal.ZERO) > 0) {
            percent = next.subtract(previous)
                    .divide(previous, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .abs()
                    .setScale(1, RoundingMode.HALF_UP);
        }

        String message = request.message();
        if (message == null || message.isBlank()) {
            message = EmailTemplateBuilder.buildInAppMessage(type, previous, next, request.currency(), percent);
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

        if (request.sendEmail()) {
            sendEmailAlert(request, type, previous, next, percent);
        }
    }

    private void sendEmailAlert(
            CreatePriceChangeNotificationRequest request,
            NotificationType type,
            BigDecimal previous,
            BigDecimal next,
            BigDecimal percent
    ) {
        final String appUrl = appProperties.getUrl();
        userContactRepository.findById(request.userId()).ifPresentOrElse(user -> {
            String name = user.getName() != null ? user.getName() : user.getEmail();
            String productId = request.productId();
            String productTitle = request.productTitle();
            String currency = request.currency();

            EmailTemplateBuilder.EmailContent email = switch (type) {
                case PRICE_DROP -> emailTemplateBuilder.buildPriceDrop(
                        name, productTitle, previous, next, currency, percent, productId, appUrl);
                case PRICE_INCREASE -> emailTemplateBuilder.buildPriceIncrease(
                        name, productTitle, previous, next, currency, percent, productId, appUrl);
                default -> emailTemplateBuilder.buildPriceUpdate(
                        name, productTitle, next, currency, productId, appUrl);
            };

            emailNotificationSender.send(user.getEmail(), email.subject(), email.htmlBody());
        }, () -> log.warn("User {} not found for email alert on product {}", request.userId(), request.productId()));
    }

    private static NotificationType resolveTypeFromPrices(BigDecimal previous, BigDecimal next) {
        int cmp = next.compareTo(previous);
        if (cmp < 0) {
            return NotificationType.PRICE_DROP;
        }
        if (cmp > 0) {
            return NotificationType.PRICE_INCREASE;
        }
        return NotificationType.SYSTEM;
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
