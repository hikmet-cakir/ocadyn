package com.ocadyn.security;

import com.ocadyn.config.JwtProperties;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    @Test
    void generateAndParse_shouldExtractClaimsAndPrincipal() {
        JwtService jwtService = new JwtService(new JwtProperties(base64Secret(), 60_000));

        String token = jwtService.generateToken("u1", "alice@example.com", "Alice");

        assertTrue(jwtService.isTokenValid(token));
        assertEquals("alice@example.com", jwtService.extractUsername(token));
        assertEquals("u1", jwtService.extractUserId(token));
        assertEquals("Alice", jwtService.extractName(token));
        JwtUserPrincipal principal = jwtService.parsePrincipal(token);
        assertEquals("u1", principal.userId());
        assertEquals("alice@example.com", principal.email());
        assertEquals("Alice", principal.name());
    }

    @Test
    void isTokenValid_shouldReturnFalse_forExpiredOrInvalidToken() {
        JwtService expiredService = new JwtService(new JwtProperties(base64Secret(), -1));
        String expiredToken = expiredService.generateToken("u1", "a@b.com", "A");
        assertFalse(expiredService.isTokenValid(expiredToken));
        assertFalse(expiredService.isTokenValid("not-a-jwt"));
    }

    @Test
    void parsePrincipal_shouldFallbackNameToEmail_whenNameMissing() {
        JwtService jwtService = new JwtService(new JwtProperties(base64Secret(), 60_000));
        String token = jwtService.generateToken("u1", "user@example.com", null);

        JwtUserPrincipal principal = jwtService.parsePrincipal(token);

        assertEquals("user@example.com", principal.name());
    }

    @Test
    void parsePrincipal_shouldThrow_whenRequiredClaimsMissing() {
        JwtService jwtService = new JwtService(new JwtProperties(base64Secret(), 60_000));
        String tokenWithoutUid = io.jsonwebtoken.Jwts.builder()
                .subject("user@example.com")
                .issuedAt(new java.util.Date())
                .expiration(new java.util.Date(System.currentTimeMillis() + 60_000))
                .signWith(io.jsonwebtoken.security.Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode(base64Secret())))
                .compact();

        assertThrows(IllegalArgumentException.class, () -> jwtService.parsePrincipal(tokenWithoutUid));
    }

    private static String base64Secret() {
        return Base64.getEncoder().encodeToString("01234567890123456789012345678901".getBytes());
    }
}
