package com.copyforge.controller;

import com.copyforge.dto.UserDto;
import com.copyforge.entity.User;
import com.copyforge.service.UserService;
import com.copyforge.service.GenerationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final GenerationService generationService;

    public UserController(UserService userService, GenerationService generationService) {
        this.userService = userService;
        this.generationService = generationService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(new UserDto.UserProfile(
                user.getId(), user.getName(), user.getEmail(),
                user.getSubscriptionTier().name(),
                user.getGenerationsUsed(), user.getGenerationsLimit(),
                user.getBrandVoice(), user.getBrandIndustry(), user.getBrandTargetAudience()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserDto.UpdateProfileRequest request) {
        User user = userService.getCurrentUser();
        User updated = userService.updateProfile(user, request.getName(), request.getEmail());
        return ResponseEntity.ok(new UserDto.UserProfile(
                updated.getId(), updated.getName(), updated.getEmail(),
                updated.getSubscriptionTier().name(),
                updated.getGenerationsUsed(), updated.getGenerationsLimit(),
                updated.getBrandVoice(), updated.getBrandIndustry(), updated.getBrandTargetAudience()
        ));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody UserDto.ChangePasswordRequest request) {
        User user = userService.getCurrentUser();
        userService.changePassword(user, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount() {
        User user = userService.getCurrentUser();
        userService.deleteAccount(user);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    @PutMapping("/brand")
    public ResponseEntity<?> updateBrand(@RequestBody UserDto.UpdateBrandRequest request) {
        User user = userService.getCurrentUser();
        User updated = userService.updateBrand(user, request.getBrandVoice(),
                request.getBrandIndustry(), request.getBrandTargetAudience());
        return ResponseEntity.ok(Map.of("message", "Brand settings updated", "brandVoice", updated.getBrandVoice()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        User user = userService.getCurrentUser();
        UserDto.DashboardStats stats = new UserDto.DashboardStats();
        stats.setTotalGenerations((int) generationService.getTotalGenerations(user));
        stats.setGenerationsThisMonth(user.getGenerationsUsed());
        stats.setAverageScore(generationService.getAverageScore(user));
        stats.setSubscriptionTier(user.getSubscriptionTier().name());

        if (user.getGenerationsLimit() == -1) {
            stats.setGenerationsRemaining(-1);
        } else {
            stats.setGenerationsRemaining(user.getGenerationsLimit() - user.getGenerationsUsed());
        }

        return ResponseEntity.ok(stats);
    }
}
