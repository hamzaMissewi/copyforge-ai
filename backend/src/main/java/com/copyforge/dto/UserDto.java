package com.copyforge.dto;

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
