package com.ocadyn.notification;

import com.ocadyn.common.NotificationType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Builds polished, mobile-friendly HTML email bodies for price alerts.
 *
 * Design goals:
 *  - Clear hierarchy: type label → product name → price comparison → CTA
 *  - Scannable in under 3 seconds
 *  - Works in all major email clients (inline CSS, no external resources)
 *  - Premium consumer-product feel
 */
@Component
public class EmailTemplateBuilder {

    private static final String TEMPLATE = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <meta name="x-apple-disable-message-reformatting">
              <title>%s</title>
            </head>
            <body style="margin:0;padding:0;background-color:#eef2fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%%;">
              <div style="max-width:560px;margin:0 auto;padding:40px 16px 32px;">

                <!-- Logo -->
                <div style="text-align:center;margin-bottom:28px;">
                  <span style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:1px;padding:8px 20px;border-radius:10px;">OCADYN</span>
                </div>

                <!-- Main card -->
                <div style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.09);">

                  <!-- Colour strip: green=drop, amber=increase, blue=update -->
                  <div style="height:4px;background:%s;"></div>

                  <div style="padding:32px;">

                    <!-- Type label -->
                    <p style="margin:0 0 10px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:%s;">%s</p>

                    <!-- Product name -->
                    <h1 style="margin:0 0 8px;font-size:21px;font-weight:700;color:#0f172a;line-height:1.3;">%s</h1>

                    <!-- Greeting -->
                    <p style="margin:0 0 24px;font-size:15px;color:#64748b;">%s</p>

                    <!-- Price block -->
                    <div style="background:#f8fafc;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
                      <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="width:40%%;vertical-align:top;padding-right:8px;">
                            <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:#94a3b8;">Was</p>
                            <p style="margin:0;font-size:18px;font-weight:600;color:#94a3b8;text-decoration:line-through;">%s</p>
                          </td>
                          <td style="width:20%%;text-align:center;vertical-align:middle;padding-top:16px;">
                            <span style="font-size:18px;color:#cbd5e1;">→</span>
                          </td>
                          <td style="width:40%%;vertical-align:top;text-align:right;padding-left:8px;">
                            <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:#94a3b8;">Now</p>
                            <p style="margin:0;font-size:26px;font-weight:800;color:%s;line-height:1;">%s</p>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="3" style="padding-top:16px;">
                            <div style="background:%s;border-radius:8px;padding:10px 14px;text-align:center;">
                              <span style="font-size:14px;font-weight:700;color:%s;">%s</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- CTA Button -->
                    %s

                  </div>
                </div>

                <!-- Footer -->
                <div style="text-align:center;margin-top:28px;padding:0 8px;">
                  <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.5;">
                    You're tracking <strong style="color:#0f172a;">%s</strong> on OCADYN.
                  </p>
                  <p style="margin:0;font-size:12px;color:#94a3b8;">
                    Manage your alerts in
                    <a href="%s/dashboard/settings" style="color:#1d4ed8;text-decoration:none;font-weight:500;">Account Settings</a>.
                  </p>
                </div>

              </div>
            </body>
            </html>
            """;

    private static final String CTA_BUTTON = """
            <a href="%s" style="display:block;background:#1d4ed8;color:#ffffff;text-align:center;font-size:15px;font-weight:600;text-decoration:none;padding:15px 24px;border-radius:12px;letter-spacing:0.2px;">
              View Product &rarr;
            </a>
            """;

    public record EmailContent(String subject, String htmlBody) {}

    public EmailContent buildPriceDrop(
            String recipientName,
            String productTitle,
            BigDecimal previousPrice,
            BigDecimal currentPrice,
            String currency,
            BigDecimal percentChange,
            String productId,
            String appBaseUrl
    ) {
        String subject = "Price dropped " + percentChange.toPlainString() + "% \u2014 " + truncate(productTitle, 50);
        String previewHint = "Hi " + firstName(recipientName) + ", good news about a product you're tracking.";

        String formattedPrev = formatPrice(previousPrice, currency);
        String formattedNow = formatPrice(currentPrice, currency);
        String changeLabel = "Saved " + formatPrice(previousPrice.subtract(currentPrice), currency)
                + " \u00b7 Down " + percentChange.toPlainString() + "%";

        String ctaHtml = productId != null && appBaseUrl != null && !appBaseUrl.isBlank()
                ? CTA_BUTTON.formatted(appBaseUrl + "/dashboard/product?id=" + productId)
                : "";

        String body = TEMPLATE.formatted(
                subject,
                "#16a34a",         // strip colour (green)
                "#16a34a",         // label colour
                "Price Drop Alert",
                productTitle,
                previewHint,
                formattedPrev,
                "#16a34a",         // current price colour
                formattedNow,
                "#dcfce7",         // savings badge background
                "#15803d",         // savings badge text
                changeLabel,
                ctaHtml,
                productTitle,
                appBaseUrl != null ? appBaseUrl : ""
        );

        return new EmailContent(subject, body);
    }

    public EmailContent buildPriceIncrease(
            String recipientName,
            String productTitle,
            BigDecimal previousPrice,
            BigDecimal currentPrice,
            String currency,
            BigDecimal percentChange,
            String productId,
            String appBaseUrl
    ) {
        String subject = "Price update \u2014 " + truncate(productTitle, 55);
        String previewHint = "Hi " + firstName(recipientName) + ", there's been a price change on a product you're watching.";

        String formattedPrev = formatPrice(previousPrice, currency);
        String formattedNow = formatPrice(currentPrice, currency);
        String changeLabel = "Up " + percentChange.toPlainString() + "% \u00b7 " + formattedPrev + " \u2192 " + formattedNow;

        String ctaHtml = productId != null && appBaseUrl != null && !appBaseUrl.isBlank()
                ? CTA_BUTTON.formatted(appBaseUrl + "/dashboard/product?id=" + productId)
                : "";

        String body = TEMPLATE.formatted(
                subject,
                "#f59e0b",         // strip colour (amber)
                "#d97706",         // label colour
                "Price Increase",
                productTitle,
                previewHint,
                formattedPrev,
                "#0f172a",         // current price colour (neutral)
                formattedNow,
                "#fffbeb",         // badge background
                "#b45309",         // badge text
                changeLabel,
                ctaHtml,
                productTitle,
                appBaseUrl != null ? appBaseUrl : ""
        );

        return new EmailContent(subject, body);
    }

    public EmailContent buildPriceUpdate(
            String recipientName,
            String productTitle,
            BigDecimal currentPrice,
            String currency,
            String productId,
            String appBaseUrl
    ) {
        String subject = "Price update \u2014 " + truncate(productTitle, 55);
        String previewHint = "Hi " + firstName(recipientName) + ", the price on a product you're tracking has changed.";

        String formattedNow = formatPrice(currentPrice, currency);

        String ctaHtml = productId != null && appBaseUrl != null && !appBaseUrl.isBlank()
                ? CTA_BUTTON.formatted(appBaseUrl + "/dashboard/product?id=" + productId)
                : "";

        String body = TEMPLATE.formatted(
                subject,
                "#1d4ed8",         // strip colour (blue)
                "#1d4ed8",         // label colour
                "Price Update",
                productTitle,
                previewHint,
                "\u2014",          // no previous price
                "#0f172a",
                formattedNow,
                "#eff6ff",
                "#1d4ed8",
                "Current price",
                ctaHtml,
                productTitle,
                appBaseUrl != null ? appBaseUrl : ""
        );

        return new EmailContent(subject, body);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private static String firstName(String name) {
        if (name == null || name.isBlank()) return "there";
        return name.split("\\s+")[0];
    }

    private static String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max - 1) + "\u2026";
    }

    static String formatPrice(BigDecimal amount, String currency) {
        if (amount == null) return "";
        String symbol = switch (currency != null ? currency.toUpperCase() : "") {
            case "TRY" -> "₺";
            case "USD" -> "$";
            case "EUR" -> "€";
            case "GBP" -> "£";
            default -> currency != null ? currency + " " : "";
        };
        return symbol + String.format("%,.2f", amount);
    }

    public static String buildInAppMessage(
            NotificationType type,
            BigDecimal previousPrice,
            BigDecimal currentPrice,
            String currency,
            BigDecimal percentChange
    ) {
        return switch (type) {
            case PRICE_DROP -> "Down " + percentChange.toPlainString() + "% \u00b7 now "
                    + formatPrice(currentPrice, currency);
            case PRICE_INCREASE -> "Up " + percentChange.toPlainString() + "% \u00b7 now "
                    + formatPrice(currentPrice, currency);
            default -> "Now " + formatPrice(currentPrice, currency);
        };
    }
}
