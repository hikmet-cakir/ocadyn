package com.ocadyn.internal;

import com.ocadyn.internal.dto.CreatePriceChangeNotificationRequest;
import com.ocadyn.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/notifications")
public class InternalNotificationController {

    private final NotificationService notificationService;

    public InternalNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void create(@RequestBody CreatePriceChangeNotificationRequest request) {
        notificationService.createPriceChangeNotification(request);
    }
}
