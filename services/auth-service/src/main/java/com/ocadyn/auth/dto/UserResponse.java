package com.ocadyn.auth.dto;

import com.ocadyn.common.UserPlan;

public record UserResponse(
        String id,
        String name,
        String email,
        UserPlan plan,
        String locale
) {}
