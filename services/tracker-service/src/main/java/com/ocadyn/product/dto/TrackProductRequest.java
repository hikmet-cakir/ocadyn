package com.ocadyn.product.dto;

import jakarta.validation.constraints.NotBlank;

public record TrackProductRequest(@NotBlank String url) {}
