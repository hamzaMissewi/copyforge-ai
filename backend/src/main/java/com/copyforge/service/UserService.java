package com.copyforge.service;

import com.copyforge.entity.User;
import com.copyforge.exception.GenerationLimitExceededException;
import com.copyforge.exception.ResourceNotFoundException;
import com.copyforge.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public User updateBrand(User user, String brandVoice, String brandIndustry, String brandTargetAudience) {
        user.setBrandVoice(brandVoice);
        user.setBrandIndustry(brandIndustry);
        user.setBrandTargetAudience(brandTargetAudience);
        return userRepository.save(user);
    }

    public void checkAndEnforceGenerationLimit(User user) {
        if (!user.canGenerate()) {
            throw new GenerationLimitExceededException(user.getGenerationsUsed(), user.getGenerationsLimit());
        }
    }

    public void incrementGeneration(User user) {
        user.incrementGenerations();
        userRepository.save(user);
    }
}
