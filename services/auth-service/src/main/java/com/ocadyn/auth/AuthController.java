package com.ocadyn.auth;

import com.ocadyn.auth.dto.AuthResponse;
import com.ocadyn.auth.dto.LoginRequest;
import com.ocadyn.auth.dto.RegisterRequest;
import com.ocadyn.auth.dto.UpdateProfileRequest;
import com.ocadyn.auth.dto.UserResponse;
import com.ocadyn.security.AuthUserResolver;
import com.ocadyn.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final AuthUserResolver authUserResolver;

    public AuthController(AuthService authService, AuthUserResolver authUserResolver) {
        this.authService = authService;
        this.authUserResolver = authUserResolver;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new member account")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in and receive JWT")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public UserResponse me() {
        User user = authUserResolver.requireCurrentUser();
        return authService.toUserResponse(user);
    }

    @PatchMapping("/me")
    @Operation(summary = "Update profile")
    public UserResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = authUserResolver.requireCurrentUser();
        return authService.updateProfile(user, request);
    }
}
