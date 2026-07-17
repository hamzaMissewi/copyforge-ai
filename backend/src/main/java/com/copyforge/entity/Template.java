package com.copyforge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Generation.ContentType contentType;

    @Column(nullable = false)
    private String platform;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String systemPrompt;

    @Column(columnDefinition = "TEXT")
    private String exampleOutput;

    @Column
    @Builder.Default
    private Boolean isPremium = false;

    @Column
    @Builder.Default
    private Integer usageCount = 0;

    @Column
    private String category;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
