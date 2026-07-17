package com.copyforge.service;

import com.copyforge.dto.GenerationDto;
import com.copyforge.entity.Generation;
import com.copyforge.entity.User;
import com.copyforge.repository.GenerationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GenerationService {

    private final GenerationRepository generationRepository;

    public GenerationService(GenerationRepository generationRepository) {
        this.generationRepository = generationRepository;
    }

    public Generation saveGeneration(User user, GenerationDto.GenerateRequest request, String generatedContent,
                                     Double score, String feedback) {
        int wordCount = generatedContent.split("\\s+").length;
        int charCount = generatedContent.length();

        Generation generation = Generation.builder()
                .user(user)
                .contentType(request.getContentType())
                .platform(request.getPlatform())
                .prompt(request.getPrompt())
                .generatedContent(generatedContent)
                .score(score)
                .feedback(feedback)
                .wordCount(wordCount)
                .characterCount(charCount)
                .build();

        return generationRepository.save(generation);
    }

    public Page<Generation> getUserGenerations(User user, int page, int size) {
        return generationRepository.findByUserOrderByCreatedAtDesc(user, PageRequest.of(page, size));
    }

    public Page<Generation> getGenerationsByType(User user, Generation.ContentType contentType, int page, int size) {
        return generationRepository.findByUserAndContentTypeOrderByCreatedAtDesc(user, contentType, PageRequest.of(page, size));
    }

    public Page<Generation> getBookmarkedGenerations(User user, int page, int size) {
        return generationRepository.findByUserAndBookmarkedOrderByCreatedAtDesc(user, true, PageRequest.of(page, size));
    }

    public List<Generation> getRecentGenerations(User user) {
        return generationRepository.findTop5ByUserOrderByCreatedAtDesc(user);
    }

    public Generation toggleBookmark(Long id, User user) {
        Generation generation = generationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Generation not found"));

        if (!generation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        generation.setBookmarked(!generation.getBookmarked());
        return generationRepository.save(generation);
    }

    public double getAverageScore(User user) {
        Double avg = generationRepository.getAverageScoreByUser(user);
        return avg != null ? avg : 0.0;
    }

    public long getTotalGenerations(User user) {
        return generationRepository.countByUser(user);
    }

    public void deleteGeneration(Long id, User user) {
        Generation generation = generationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Generation not found"));
        if (!generation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        generationRepository.delete(generation);
    }
}
