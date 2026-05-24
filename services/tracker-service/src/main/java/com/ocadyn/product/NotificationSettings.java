package com.ocadyn.product;

import com.ocadyn.common.NotificationFrequency;

public class NotificationSettings {
    private NotificationChannelSettings channels = new NotificationChannelSettings();
    private TriggerSettings triggers = new TriggerSettings();
    private NotificationFrequency frequency = NotificationFrequency.TWELVE_HOURS;

    public NotificationChannelSettings getChannels() {
        return channels;
    }

    public void setChannels(NotificationChannelSettings channels) {
        this.channels = channels;
    }

    public TriggerSettings getTriggers() {
        return triggers;
    }

    public void setTriggers(TriggerSettings triggers) {
        this.triggers = triggers;
    }

    public NotificationFrequency getFrequency() {
        return frequency;
    }

    public void setFrequency(NotificationFrequency frequency) {
        this.frequency = frequency;
    }
}
