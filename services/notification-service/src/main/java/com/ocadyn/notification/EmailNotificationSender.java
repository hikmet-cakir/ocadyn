package com.ocadyn.notification;

import com.ocadyn.config.MailProperties;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class EmailNotificationSender {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationSender.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final MailProperties mailProperties;

    public EmailNotificationSender(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            MailProperties mailProperties
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.mailProperties = mailProperties;
    }

    public void send(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            log.warn("Skipping email send: recipient is empty");
            return;
        }
        if (!mailProperties.isConfigured()) {
            log.warn(
                    "Email not sent to {}: SMTP is not configured. Set MAIL_HOST, MAIL_USER, MAIL_PASS and MAIL_FROM.",
                    to
            );
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Email not sent to {}: JavaMailSender bean is unavailable", to);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, StandardCharsets.UTF_8.name());
            helper.setFrom(mailProperties.getFrom());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // HTML email
            mailSender.send(mimeMessage);
            log.info("Sent price alert email to {}", to);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage(), ex);
        }
    }
}
