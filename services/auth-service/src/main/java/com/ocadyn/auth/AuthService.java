package com.ocadyn.auth;

import com.ocadyn.auth.dto.AuthResponse;
import com.ocadyn.auth.dto.LoginRequest;
import com.ocadyn.auth.dto.RegisterRequest;
import com.ocadyn.auth.dto.UpdateProfileRequest;
import com.ocadyn.auth.dto.UserResponse;
import com.ocadyn.common.exception.ApiException;
import com.ocadyn.security.JwtService;
import com.ocadyn.user.User;
import com.ocadyn.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException(409, "Email already registered");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(),
                        request.password()
                )
        );
        User user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(() -> new ApiException(401, "Invalid credentials"));
        return buildAuthResponse(user);
    }

    public UserResponse updateProfile(User user, UpdateProfileRequest request) {
        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }
        if (request.locale() != null && !request.locale().isBlank()) {
            user.setLocale(request.locale().trim());
        }
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getPlan(), user.getLocale());
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getName());
        return new AuthResponse(token, toUserResponse(user));
    }
}
