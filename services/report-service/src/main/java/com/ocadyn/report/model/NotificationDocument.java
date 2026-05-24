package com.ocadyn.report.model;

import com.ocadyn.common.NotificationType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "notifications")
public class NotificationDocument {

    @Id
    private String id;
    private String userId;
    private NotificationType type;
    private boolean read;
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public NotificationType getType() {
        return type;
    }

    public boolean isRead() {
        return read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
