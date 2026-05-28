package com.ocadyn.notification;

import com.ocadyn.common.Marketplace;
import com.ocadyn.common.NotificationType;
import com.ocadyn.common.exception.ApiException;
import com.ocadyn.internal.dto.CreatePriceChangeNotificationRequest;
import com.ocadyn.notification.dto.NotificationResponse;
import com.ocadyn.user.UserContact;
import com.ocadyn.user.UserContactRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private AppNotificationRepository notificationRepository;

    @Mock
    private UserContactRepository userContactRepository;

    @Mock
    private EmailNotificationSender emailNotificationSender;

    @InjectMocks
    private NotificationService service;

    @Test
    void list_shouldUseFindByUserId_whenTypeIsNull() {
        AppNotification notification = buildNotification();
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("u1")).thenReturn(List.of(notification));

        List<NotificationResponse> responses = service.list("u1", null);

        assertEquals(1, responses.size());
        assertEquals("n1", responses.getFirst().id());
        assertEquals("Phone", responses.getFirst().productTitle());
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc("u1");
        verify(notificationRepository, never()).findByUserIdAndTypeOrderByCreatedAtDesc(any(), any());
    }

    @Test
    void list_shouldUseFindByUserIdAndType_whenTypeProvided() {
        AppNotification notification = buildNotification();
        when(notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc("u1", NotificationType.PRICE_DROP))
                .thenReturn(List.of(notification));

        List<NotificationResponse> responses = service.list("u1", NotificationType.PRICE_DROP);

        assertEquals(1, responses.size());
        assertEquals(NotificationType.PRICE_DROP, responses.getFirst().type());
        verify(notificationRepository).findByUserIdAndTypeOrderByCreatedAtDesc("u1", NotificationType.PRICE_DROP);
    }

    @Test
    void markRead_shouldSetReadAndSave_whenOwnedByUser() {
        AppNotification notification = buildNotification();
        notification.setRead(false);
        when(notificationRepository.findById("n1")).thenReturn(Optional.of(notification));

        service.markRead("u1", "n1");

        assertTrue(notification.isRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void markRead_shouldThrow_whenNotificationMissingOrNotOwned() {
        AppNotification notification = buildNotification();
        notification.setUserId("other");
        when(notificationRepository.findById("n1")).thenReturn(Optional.of(notification));

        ApiException ex = assertThrows(ApiException.class, () -> service.markRead("u1", "n1"));
        assertEquals(404, ex.getStatus());
    }

    @Test
    void markAllRead_shouldOnlyMarkUnread() {
        AppNotification unread = buildNotification();
        unread.setRead(false);
        AppNotification alreadyRead = buildNotification();
        alreadyRead.setId("n2");
        alreadyRead.setRead(true);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("u1")).thenReturn(List.of(unread, alreadyRead));

        service.markAllRead("u1");

        assertTrue(unread.isRead());
        assertTrue(alreadyRead.isRead());
        ArgumentCaptor<List<AppNotification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());
        assertEquals(1, captor.getValue().size());
        assertEquals("n1", captor.getValue().getFirst().getId());
    }

    @Test
    void countUnread_shouldDelegateToRepository() {
        when(notificationRepository.countByUserIdAndReadFalse("u1")).thenReturn(7L);
        assertEquals(7L, service.countUnread("u1"));
    }

    @Test
    void createPriceChangeNotification_shouldBuildDropMessageAndSendEmail_whenEnabledAndUserExists() {
        CreatePriceChangeNotificationRequest request = new CreatePriceChangeNotificationRequest(
                "u1",
                "p1",
                "Phone",
                "img",
                Marketplace.AMAZON,
                new BigDecimal("100"),
                new BigDecimal("90"),
                "TRY",
                null,
                null,
                true
        );
        UserContact user = new UserContact();
        user.setId("u1");
        user.setName("Ali");
        user.setEmail("ali@example.com");
        when(userContactRepository.findById("u1")).thenReturn(Optional.of(user));

        service.createPriceChangeNotification(request);

        ArgumentCaptor<AppNotification> notificationCaptor = ArgumentCaptor.forClass(AppNotification.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        AppNotification saved = notificationCaptor.getValue();
        assertEquals(NotificationType.PRICE_DROP, saved.getType());
        assertEquals("Price dropped by 10.0%", saved.getMessage());
        assertFalse(saved.isRead());
        verify(emailNotificationSender).send(any(), any(), any());
    }

    @Test
    void createPriceChangeNotification_shouldUseProvidedMessageAndSkipEmail_whenDisabled() {
        CreatePriceChangeNotificationRequest request = new CreatePriceChangeNotificationRequest(
                "u1",
                "p1",
                "Phone",
                "img",
                Marketplace.AMAZON,
                BigDecimal.ZERO,
                new BigDecimal("250"),
                "TRY",
                NotificationType.SYSTEM,
                "Manual message",
                false
        );

        service.createPriceChangeNotification(request);

        ArgumentCaptor<AppNotification> captor = ArgumentCaptor.forClass(AppNotification.class);
        verify(notificationRepository).save(captor.capture());
        AppNotification saved = captor.getValue();
        assertEquals(NotificationType.SYSTEM, saved.getType());
        assertEquals("Manual message", saved.getMessage());
        verify(emailNotificationSender, never()).send(any(), any(), any());
    }

    @Test
    void createPriceChangeNotification_shouldFallbackToPriceUpdateMessage_whenPreviousIsZero() {
        CreatePriceChangeNotificationRequest request = new CreatePriceChangeNotificationRequest(
                "u1",
                "p1",
                "Phone",
                "img",
                Marketplace.AMAZON,
                BigDecimal.ZERO,
                new BigDecimal("250"),
                "TRY",
                null,
                null,
                false
        );

        service.createPriceChangeNotification(request);

        ArgumentCaptor<AppNotification> captor = ArgumentCaptor.forClass(AppNotification.class);
        verify(notificationRepository).save(captor.capture());
        assertEquals("Price update: 250 TRY", captor.getValue().getMessage());
        assertEquals(NotificationType.PRICE_INCREASE, captor.getValue().getType());
    }

    @Test
    void createPriceChangeNotification_shouldNotSendEmail_whenUserMissing() {
        CreatePriceChangeNotificationRequest request = new CreatePriceChangeNotificationRequest(
                "u404",
                "p1",
                "Phone",
                "img",
                Marketplace.AMAZON,
                new BigDecimal("100"),
                new BigDecimal("110"),
                "TRY",
                null,
                null,
                true
        );
        when(userContactRepository.findById("u404")).thenReturn(Optional.empty());

        service.createPriceChangeNotification(request);

        verify(emailNotificationSender, never()).send(any(), any(), any());
    }

    private static AppNotification buildNotification() {
        AppNotification notification = new AppNotification();
        notification.setId("n1");
        notification.setUserId("u1");
        notification.setProductId("p1");
        notification.setProductTitle("Phone");
        notification.setProductImage("img");
        notification.setMarketplace(Marketplace.AMAZON);
        notification.setType(NotificationType.PRICE_DROP);
        notification.setMessage("Price dropped");
        notification.setPreviousPrice(new BigDecimal("100"));
        notification.setCurrentPrice(new BigDecimal("90"));
        notification.setCurrency("TRY");
        notification.setRead(false);
        notification.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return notification;
    }
}
