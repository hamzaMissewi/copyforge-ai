package com.copyforge.service;

import com.copyforge.dto.GenerationDto;
import com.copyforge.entity.Generation;
import com.copyforge.entity.User;
import com.copyforge.exception.AiServiceException;
import com.copyforge.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String generateContent(User user, GenerationDto.GenerateRequest request, String templateSystemPrompt) {
        if (shouldUseFallback()) {
            return buildFallbackContent(request);
        }

        String systemPrompt = buildSystemPrompt(user, request, templateSystemPrompt);
        String userPrompt = request.getPrompt();

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");

        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", systemPrompt + "\n\nUser request: " + userPrompt);
        parts.add(part);
        userMessage.put("parts", parts);
        contents.add(userMessage);

        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.9);
        generationConfig.put("maxOutputTokens", 2048);
        generationConfig.put("topP", 0.95);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
        } catch (Exception e) {
            log.error("Failed to generate content with Gemini: {}", e.getMessage(), e);
            throw new AiServiceException("Failed to generate content with AI service: " + e.getMessage(), e);
        }
    }

    public String refineContent(String originalContent, String instruction) {
        if (shouldUseFallback()) {
            return "Refined draft: " + originalContent + "\n\nSuggested improvement: " + instruction;
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");

        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", "You are a professional marketing copywriter. Refine the following marketing copy based on this instruction: " + instruction + "\n\nOriginal content:\n" + originalContent + "\n\nProvide only the refined content, no explanations.");
        parts.add(part);
        userMessage.put("parts", parts);
        contents.add(userMessage);

        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 2048);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
        } catch (Exception e) {
            log.error("Failed to refine content: {}", e.getMessage(), e);
            throw new AiServiceException("Failed to refine content: " + e.getMessage(), e);
        }
    }

    public GenerationDto.ScoreResponse scoreContent(String content, String platform, String contentType) {
        if (shouldUseFallback()) {
            GenerationDto.ScoreResponse fallback = new GenerationDto.ScoreResponse();
            fallback.setScore(78.0);
            fallback.setFeedback("Fallback scoring used because no live Gemini API key is configured. Please review the draft manually.");
            fallback.setSuggestions(new String[]{"Sharpen the headline", "Add a stronger call to action", "Tailor the message to the audience"});
            return fallback;
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        String scoringPrompt = "You are a marketing copy expert. Score the following " +
                (contentType != null ? contentType : "marketing") + " copy for " +
                (platform != null ? platform : "general") + " on a scale of 1-100.\n\n" +
                "Content: " + content + "\n\n" +
                "Respond in JSON format only:\n" +
                "{\"score\": <number>, \"feedback\": \"<detailed feedback>\", \"suggestions\": [\"<suggestion1>\", \"<suggestion2>\", \"<suggestion3>\"]}";

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", scoringPrompt);
        parts.add(part);
        userMessage.put("parts", parts);
        contents.add(userMessage);

        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.3);
        generationConfig.put("maxOutputTokens", 1024);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String responseText = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();

            String jsonStr = responseText.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            JsonNode scoreNode = objectMapper.readTree(jsonStr);

            GenerationDto.ScoreResponse scoreResponse = new GenerationDto.ScoreResponse();
            scoreResponse.setScore(scoreNode.path("score").asDouble());
            scoreResponse.setFeedback(scoreNode.path("feedback").asText());

            List<String> suggestions = new ArrayList<>();
            scoreNode.path("suggestions").forEach(s -> suggestions.add(s.asText()));
            scoreResponse.setSuggestions(suggestions.toArray(new String[0]));

            return scoreResponse;
        } catch (Exception e) {
            log.warn("Could not score content with AI, using fallback: {}", e.getMessage());
            GenerationDto.ScoreResponse fallback = new GenerationDto.ScoreResponse();
            fallback.setScore(70.0);
            fallback.setFeedback("Could not score content automatically. Please review manually.");
            fallback.setSuggestions(new String[]{"Add a clear call-to-action", "Consider your target audience", "Make the headline more attention-grabbing"});
            return fallback;
        }
    }

    private boolean shouldUseFallback() {
        String normalizedApiKey = Optional.ofNullable(apiKey).orElse("").trim();
        return normalizedApiKey.isBlank()
                || normalizedApiKey.contains("placeholder")
                || normalizedApiKey.equalsIgnoreCase("your-gemini-api-key-here");
    }

    private String buildFallbackContent(GenerationDto.GenerateRequest request) {
        String safePrompt = Optional.ofNullable(request.getPrompt()).orElse("marketing content").trim();
        String safePlatform = Optional.ofNullable(request.getPlatform()).orElse("general audience");
        String safeContentType = Optional.ofNullable(request.getContentType()).map(Enum::name).orElse("marketing");

        return "Fallback draft for " + safePlatform + " (" + safeContentType + ")\n\n"
                + "1. " + safePrompt + " that feels clear, benefit-led, and action-oriented.\n"
                + "2. A concise second option with stronger urgency and a direct call to action.\n"
                + "3. A polished final version tailored for conversion and brand consistency.";
    }

    private String buildSystemPrompt(User user, GenerationDto.GenerateRequest request, String templateSystemPrompt) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert marketing copywriter creating high-converting content.\n\n");

        if (templateSystemPrompt != null) {
            prompt.append("Template Instructions: ").append(templateSystemPrompt).append("\n\n");
        }

        if (user.getBrandVoice() != null) {
            prompt.append("Brand Voice: ").append(user.getBrandVoice()).append("\n");
        }
        if (user.getBrandIndustry() != null) {
            prompt.append("Industry: ").append(user.getBrandIndustry()).append("\n");
        }
        if (user.getBrandTargetAudience() != null) {
            prompt.append("Target Audience: ").append(user.getBrandTargetAudience()).append("\n");
        }

        prompt.append("\nContent Type: ").append(formatContentType(request.getContentType()));
        prompt.append("\nPlatform: ").append(request.getPlatform());

        if (request.getTone() != null) {
            prompt.append("\nTone: ").append(request.getTone());
        }
        if (request.getWordLimit() != null) {
            prompt.append("\nWord Limit: Approximately ").append(request.getWordLimit()).append(" words");
        }

        prompt.append("\n\nProvide multiple variations (3-5) of the content. Format them clearly numbered.");
        prompt.append("\nMake the copy engaging, persuasive, and optimized for the target platform.");
        prompt.append("\nUse proven copywriting frameworks (AIDA, PAS, etc.) where appropriate.");

        return prompt.toString();
    }

    private String formatContentType(Generation.ContentType type) {
        return type.name().replace("_", " ").toLowerCase();
    }
}
