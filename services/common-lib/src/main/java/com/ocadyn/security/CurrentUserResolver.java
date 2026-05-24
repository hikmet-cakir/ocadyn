package com.ocadyn.security;

import com.ocadyn.common.exception.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserResolver {

    public JwtUserPrincipal requirePrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof JwtUserPrincipal principal)) {
            throw new ApiException(401, "Unauthorized");
        }
        return principal;
    }

    public String requireUserId() {
        return requirePrincipal().userId();
    }
}
