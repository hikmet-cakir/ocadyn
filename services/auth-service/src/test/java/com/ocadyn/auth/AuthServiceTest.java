package com.ocadyn.auth;

import com.ocadyn.auth.dto.AuthResponse;
import com.ocadyn.auth.dto.LoginRequest;
import com.ocadyn.auth.dto.RegisterRequest;
import com.ocadyn.auth.dto.UpdateProfileRequest;
import com.ocadyn.common.UserPlan;
import com.ocadyn.common.exception.ApiException;
import com.ocadyn.security.JwtService;
import com.ocadyn.user.User;
import com.ocadyn.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_shouldThrow_whenEmailExists() {
        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(true);

        ApiException ex = assertThrows(
                ApiException.class,
                () -> authService.register(new RegisterRequest("Name", "test@example.com", "secret123"))
        );

        assertEquals(409, ex.getStatus());
    }

    @Test
    void register_shouldNormalizeAndEncodePassword() {
        RegisterRequest request = new RegisterRequest("  Alice  ", "  TEST@EXAMPLE.COM  ", "secret123");
        when(userRepository.existsByEmailIgnoreCase(request.email())).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hash");
        when(jwtService.generateToken(any(), any(), any())).thenReturn("jwt");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("u1");
            return user;
        });

        AuthResponse response = authService.register(request);

        assertEquals("jwt", response.token());
        assertEquals("u1", response.user().id());
        assertEquals("Alice", response.user().name());
        assertEquals("test@example.com", response.user().email());
    }

    @Test
    void login_shouldAuthenticateAndReturnToken() {
        User user = new User();
        user.setId("u1");
        user.setName("Alice");
        user.setEmail("alice@example.com");
        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken("u1", "alice@example.com", "Alice")).thenReturn("jwt");

        AuthResponse response = authService.login(new LoginRequest("  ALICE@example.com ", "secret"));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        assertEquals("jwt", response.token());
        assertEquals("u1", response.user().id());
    }

    @Test
    void login_shouldThrow_whenUserNotFoundAfterAuthentication() {
        when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(
                ApiException.class,
                () -> authService.login(new LoginRequest("missing@example.com", "secret"))
        );

        assertEquals(401, ex.getStatus());
    }

    @Test
    void updateProfile_shouldUpdateOnlyNonBlankFields() {
        User user = new User();
        user.setId("u1");
        user.setName("Old");
        user.setEmail("old@example.com");
        user.setLocale("en");
        user.setPlan(UserPlan.FREE);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = authService.updateProfile(user, new UpdateProfileRequest("  New Name ", " tr "));

        assertEquals("New Name", response.name());
        assertEquals("tr", response.locale());
        assertEquals("old@example.com", response.email());
    }

    @Test
    void toUserResponse_shouldMapFields() {
        User user = new User();
        user.setId("u1");
        user.setName("Alice");
        user.setEmail("alice@example.com");
        user.setPlan(UserPlan.PRO);
        user.setLocale("en");

        var response = authService.toUserResponse(user);

        assertEquals("u1", response.id());
        assertEquals(UserPlan.PRO, response.plan());
        assertTrue(response.email().contains("@"));
    }
}
