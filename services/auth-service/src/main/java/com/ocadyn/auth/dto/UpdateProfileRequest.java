package com.ocadyn.auth.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 100) String name,
        @Size(min = 2, max = 5) String locale
) {}
