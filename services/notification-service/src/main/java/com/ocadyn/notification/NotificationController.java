package com.ocadyn.notification;

import com.ocadyn.common.NotificationType;
import com.ocadyn.notification.dto.NotificationResponse;
import com.ocadyn.security.CurrentUserResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserResolver currentUserResolver;

    public NotificationController(
            NotificationService notificationService,
            CurrentUserResolver currentUserResolver
    ) {
        this.notificationService = notificationService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping
    @Operation(summary = "List notifications")
    public List<NotificationResponse> list(@RequestParam(required = false) NotificationType type) {
        return notificationService.list(currentUserResolver.requireUserId(), type);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Unread notification count")
    public Map<String, Long> unreadCount() {
        return Map.of("count", notificationService.countUnread(currentUserResolver.requireUserId()));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public void markRead(@PathVariable String id) {
        notificationService.markRead(currentUserResolver.requireUserId(), id);
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public void markAllRead() {
        notificationService.markAllRead(currentUserResolver.requireUserId());
    }
}
