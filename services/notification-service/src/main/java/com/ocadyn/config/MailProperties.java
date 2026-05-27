package com.ocadyn.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ocadyn.mail")
public class MailProperties {

    private boolean enabled = true;
    private String from = "noreply@ocadyn.local";
    private String host = "";
    private String username = "";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public boolean isConfigured() {
        return enabled
                && host != null
                && !host.isBlank()
                && username != null
                && !username.isBlank()
                && from != null
                && !from.isBlank();
    }
}
