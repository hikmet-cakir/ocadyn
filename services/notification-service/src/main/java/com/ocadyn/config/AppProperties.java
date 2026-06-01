package com.ocadyn.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ocadyn.app")
public class AppProperties {

    /** Public base URL used in email CTAs, e.g. https://ocadyn.app */
    private String url = "";

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url != null ? url.stripTrailing().replaceAll("/$", "") : "";
    }
}
