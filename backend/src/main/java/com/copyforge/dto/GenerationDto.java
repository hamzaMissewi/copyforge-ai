package com.copyforge.dto;

import com.copyforge.entity.Generation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class GenerationDto {

    @Data
    public static class GenerateRequest {
        @NotNull(message = "Content type is required")
        private Generation.ContentType contentType;

        @NotBlank(message = "Platform is required")
        private String platform;

        @NotBlank(message = "Prompt/description is required")
        private String prompt;

        private String tone;
        private Integer wordLimit;
        private Long templateId;
    }

    @Data
    public static class GenerateResponse {
        private Long id;
        private String content;
        private Double score;
        private String feedback;
        private Integer wordCount;
        private Integer characterCount;
        private String contentType;
        private String platform;
        private String createdAt;

        public GenerateResponse(Long id, String content, Double score, String feedback,
                               Integer wordCount, Integer characterCount, String contentType,
                               String platform, String createdAt) {
            this.id = id;
            this.content = content;
            this.score = score;
            this.feedback = feedback;
            this.wordCount = wordCount;
            this.characterCount = characterCount;
            this.contentType = contentType;
            this.platform = platform;
            this.createdAt = createdAt;
        }
    }

    @Data
    public static class RefineRequest {
        @NotBlank(message = "Content to refine is required")
        private String content;

        @NotBlank(message = "Refinement instruction is required")
        private String instruction;
    }

    @Data
    public static class ScoreRequest {
        @NotBlank(message = "Content is required")
        private String content;

        private String platform;
        private String contentType;
    }

    @Data
    public static class ScoreResponse {
        private Double score;
        private String feedback;
        private String[] suggestions;
    }
}
