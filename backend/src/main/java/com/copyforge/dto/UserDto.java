package com.copyforge.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class UserDto {

    @Data
    public static class UserProfile {
        private Long id;
        private String name;
        private String email;
        private String subscriptionTier;
        private Integer generationsUsed;
        private Integer generationsLimit;
        private String brandVoice;
        private String brandIndustry;
        private String brandTargetAudience;

        public UserProfile(Long id, String name, String email, String subscriptionTier,
                          Integer generationsUsed, Integer generationsLimit, String brandVoice,
                          String brandIndustry, String brandTargetAudience) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.subscriptionTier = subscriptionTier;
            this.generationsUsed = generationsUsed;
            this.generationsLimit = generationsLimit;
            this.brandVoice = brandVoice;
            this.brandIndustry = brandIndustry;
            this.brandTargetAudience = brandTargetAudience;
        }
    }

    @Data
    public static class UpdateProfileRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "New password must be at least 6 characters")
        private String newPassword;
    }

    @Data
    public static class UpdateBrandRequest {
        private String brandVoice;
        private String brandIndustry;
        private String brandTargetAudience;
    }

    @Data
    public static class DashboardStats {
        private Integer totalGenerations;
        private Integer generationsThisMonth;
        private Double averageScore;
        private String subscriptionTier;
        private Integer generationsRemaining;
    }
}
