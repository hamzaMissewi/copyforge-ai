package com.copyforge.controller;

import com.copyforge.config.RateLimiter;
import com.copyforge.dto.GenerationDto;
import com.copyforge.entity.Generation;
import com.copyforge.entity.User;
import com.copyforge.exception.UnauthorizedException;
import com.copyforge.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/generate")
public class GenerationController {

    private final GeminiService geminiService;
    private final GenerationService generationService;
    private final UserService userService;
    private final TemplateService templateService;
    private final RateLimiter rateLimiter;

    public GenerationController(GeminiService geminiService, GenerationService generationService,
                               UserService userService, TemplateService templateService,
                               RateLimiter rateLimiter) {
        this.geminiService = geminiService;
        this.generationService = generationService;
        this.userService = userService;
        this.templateService = templateService;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping
    public ResponseEntity<?> generate(@Valid @RequestBody GenerationDto.GenerateRequest request) {
        User user = userService.getCurrentUser();

        if (!rateLimiter.tryAcquire("generate:" + user.getId(), 5)) {
            return ResponseEntity.status(429).body(Map.of(
                "error", "Too many requests. Please wait a moment before generating again."
            ));
        }

        userService.checkAndEnforceGenerationLimit(user);

        String templateSystemPrompt = null;
        if (request.getTemplateId() != null) {
            templateSystemPrompt = templateService.getTemplateById(request.getTemplateId()).getSystemPrompt();
        }

        String content = geminiService.generateContent(user, request, templateSystemPrompt);
        GenerationDto.ScoreResponse scoreResponse = geminiService.scoreContent(
                content, request.getPlatform(), request.getContentType().name());

        Generation generation = generationService.saveGeneration(
                user, request, content, scoreResponse.getScore(), scoreResponse.getFeedback());
        userService.incrementGeneration(user);

        int wordCount = content.split("\\s+").length;

        return ResponseEntity.ok(new GenerationDto.GenerateResponse(
                generation.getId(), content, scoreResponse.getScore(), scoreResponse.getFeedback(),
                wordCount, content.length(), request.getContentType().name(),
                request.getPlatform(), generation.getCreatedAt().toString()
        ));
    }

    @PostMapping("/refine")
    public ResponseEntity<?> refine(@Valid @RequestBody GenerationDto.RefineRequest request) {
        User user = userService.getCurrentUser();

        if (!rateLimiter.tryAcquire("refine:" + user.getId(), 10)) {
            return ResponseEntity.status(429).body(Map.of(
                "error", "Too many requests. Please wait before refining again."
            ));
        }

        String refinedContent = geminiService.refineContent(request.getContent(), request.getInstruction());
        return ResponseEntity.ok(Map.of("content", refinedContent));
    }

    @PostMapping("/score")
    public ResponseEntity<?> score(@Valid @RequestBody GenerationDto.ScoreRequest request) {
        GenerationDto.ScoreResponse scoreResponse = geminiService.scoreContent(
                request.getContent(), request.getPlatform(), request.getContentType());
        return ResponseEntity.ok(scoreResponse);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Generation.ContentType contentType) {
        User user = userService.getCurrentUser();
        Page<Generation> generations;

        if (contentType != null) {
            generations = generationService.getGenerationsByType(user, contentType, page, size);
        } else {
            generations = generationService.getUserGenerations(user, page, size);
        }

        return ResponseEntity.ok(generations);
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecent() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(generationService.getRecentGenerations(user));
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<?> getBookmarks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(generationService.getBookmarkedGenerations(user, page, size));
    }

    @PatchMapping("/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        Generation generation = generationService.toggleBookmark(id, user);
        return ResponseEntity.ok(Map.of("bookmarked", generation.getBookmarked()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        generationService.deleteGeneration(id, user);
        return ResponseEntity.ok(Map.of("message", "Generation deleted"));
    }
}
