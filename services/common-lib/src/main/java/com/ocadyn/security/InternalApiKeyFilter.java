package com.ocadyn.security;

import com.ocadyn.config.InternalApiProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    public static final String HEADER_NAME = "X-Internal-Api-Key";

    private final InternalApiProperties internalApiProperties;

    public InternalApiKeyFilter(InternalApiProperties internalApiProperties) {
        this.internalApiProperties = internalApiProperties;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/internal/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String provided = request.getHeader(HEADER_NAME);
        String expected = internalApiProperties.key();
        if (expected == null || expected.isBlank() || !expected.equals(provided)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Invalid internal API key\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
