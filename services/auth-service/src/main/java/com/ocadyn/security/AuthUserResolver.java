package com.ocadyn.security;

import com.ocadyn.common.exception.ApiException;
import com.ocadyn.user.User;
import com.ocadyn.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class AuthUserResolver {

    private final CurrentUserResolver currentUserResolver;
    private final UserRepository userRepository;

    public AuthUserResolver(CurrentUserResolver currentUserResolver, UserRepository userRepository) {
        this.currentUserResolver = currentUserResolver;
        this.userRepository = userRepository;
    }

    public User requireCurrentUser() {
        JwtUserPrincipal principal = currentUserResolver.requirePrincipal();
        return userRepository.findByEmailIgnoreCase(principal.email())
                .orElseThrow(() -> new ApiException(401, "Unauthorized"));
    }
}
