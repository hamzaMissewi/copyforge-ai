package com.copyforge.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String email;
        private String name;
        private String subscriptionTier;
        private Integer generationsUsed;
        private Integer generationsLimit;

        public AuthResponse(String token, String email, String name, String subscriptionTier,
                           Integer generationsUsed, Integer generationsLimit) {
            this.token = token;
            this.email = email;
            this.name = name;
            this.subscriptionTier = subscriptionTier;
            this.generationsUsed = generationsUsed;
            this.generationsLimit = generationsLimit;
        }
    }
}
