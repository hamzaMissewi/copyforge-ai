package com.copyforge.service;

import com.copyforge.entity.User;
import com.copyforge.exception.DuplicateResourceException;
import com.copyforge.exception.GenerationLimitExceededException;
import com.copyforge.exception.ResourceNotFoundException;
import com.copyforge.exception.UnauthorizedException;
import com.copyforge.repository.GenerationRepository;
import com.copyforge.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final GenerationRepository generationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, GenerationRepository generationRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.generationRepository = generationRepository;
        this.passwordEncoder = passwordEncoder;
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

    public User updateProfile(User user, String name, String email) {
        if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already in use");
        }
        user.setName(name);
        user.setEmail(email);
        return userRepository.save(user);
    }

    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(User user) {
        generationRepository.deleteAllByUser(user);
        userRepository.delete(user);
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
