package com.copyforge.controller;

import com.copyforge.dto.AuthDto;
import com.copyforge.entity.User;
import com.copyforge.repository.UserRepository;
import com.copyforge.security.JwtTokenProvider;
import com.copyforge.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                         PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider,
                         UserService userService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .subscriptionTier(User.SubscriptionTier.FREE)
                .generationsUsed(0)
                .generationsLimit(5)
                .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthDto.AuthResponse(
                token, user.getEmail(), user.getName(),
                user.getSubscriptionTier().name(),
                user.getGenerationsUsed(), user.getGenerationsLimit()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        return ResponseEntity.ok(new AuthDto.AuthResponse(
                token, user.getEmail(), user.getName(),
                user.getSubscriptionTier().name(),
                user.getGenerationsUsed(), user.getGenerationsLimit()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = userService.getCurrentUser();

        return ResponseEntity.ok(new AuthDto.AuthResponse(
                null, user.getEmail(), user.getName(),
                user.getSubscriptionTier().name(),
                user.getGenerationsUsed(), user.getGenerationsLimit()
        ));
    }
}
