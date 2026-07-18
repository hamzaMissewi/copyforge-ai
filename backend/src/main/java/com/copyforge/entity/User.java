package com.copyforge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubscriptionTier subscriptionTier = SubscriptionTier.FREE;

    @Column(nullable = false)
    @Builder.Default
    private Integer generationsUsed = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer generationsLimit = 5;

    @Column
    private String stripeCustomerId;

    @Column
    private String stripeSubscriptionId;

    @Column
    private String brandVoice;

    @Column
    private String brandIndustry;

    @Column
    private String brandTargetAudience;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum SubscriptionTier {
        FREE, PRO, BUSINESS
    }

    public boolean canGenerate() {
        return generationsLimit < 0 || generationsUsed < generationsLimit;
    }

    public void incrementGenerations() {
        this.generationsUsed++;
    }
}
