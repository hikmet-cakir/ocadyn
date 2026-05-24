package com.ocadyn.security;

public record JwtUserPrincipal(String userId, String email, String name) {}
