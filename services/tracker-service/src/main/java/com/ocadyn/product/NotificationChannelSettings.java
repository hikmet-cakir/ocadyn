package com.ocadyn.product;

public class NotificationChannelSettings {
    private boolean email = true;
    private boolean sms = false;
    private boolean phone = false;
    private boolean push = true;

    public boolean isEmail() {
        return email;
    }

    public void setEmail(boolean email) {
        this.email = email;
    }

    public boolean isSms() {
        return sms;
    }

    public void setSms(boolean sms) {
        this.sms = sms;
    }

    public boolean isPhone() {
        return phone;
    }

    public void setPhone(boolean phone) {
        this.phone = phone;
    }

    public boolean isPush() {
        return push;
    }

    public void setPush(boolean push) {
        this.push = push;
    }
}
