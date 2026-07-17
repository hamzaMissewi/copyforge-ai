package com.copyforge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "generations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Generation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ContentType contentType;

    @Column(nullable = false)
    private String platform;

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String generatedContent;

    @Column(columnDefinition = "TEXT")
    private String refinedContent;

    @Column
    private Double score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column
    private Integer wordCount;

    @Column
    private Integer characterCount;

    @Column
    @Builder.Default
    private Boolean bookmarked = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ContentType {
        SOCIAL_MEDIA_POST,
        EMAIL_CAMPAIGN,
        AD_COPY,
        PRODUCT_DESCRIPTION,
        BLOG_INTRO,
        LANDING_PAGE,
        PUSH_NOTIFICATION,
        SMS_MARKETING,
        LINKEDIN_POST,
        TWEET_THREAD
    }
}
