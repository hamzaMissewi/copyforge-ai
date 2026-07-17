package com.copyforge.service;

import com.copyforge.entity.User;
import com.copyforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class StripeService {

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    private final UserRepository userRepository;

    public StripeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Map<String, String> createCheckoutSession(User user, String priceId) {
        // Stripe Checkout Session integration
        // In production, use: com.stripe:stripe-java SDK
        //
        // SessionCreateParams params = SessionCreateParams.builder()
        //     .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
        //     .addLineItem(SessionCreateParams.LineItem.builder()
        //         .setPrice(priceId)
        //         .setQuantity(1L)
        //         .build())
        //     .setSuccessUrl("https://copyforge.ai/dashboard?session_id={CHECKOUT_SESSION_ID}")
        //     .setCancelUrl("https://copyforge.ai/dashboard/pricing")
        //     .putMetadata("userId", user.getId().toString())
        //     .build();
        //
        // Session session = Session.create(params);

        return Map.of(
            "sessionId", "placeholder_session_id",
            "url", "https://checkout.stripe.com/pay/placeholder"
        );
    }

    public void handleSubscriptionSuccess(String sessionId, String customerId, String subscriptionId) {
        // In production, verify with Stripe webhooks
        // Update user subscription tier and IDs
    }

    public void handleSubscriptionCancelled(String subscriptionId) {
        // Downgrade user to FREE tier
    }

    public void upgradeUserToPro(User user, String stripeCustomerId, String stripeSubscriptionId) {
        user.setSubscriptionTier(User.SubscriptionTier.PRO);
        user.setGenerationsLimit(-1); // -1 = unlimited
        user.setStripeCustomerId(stripeCustomerId);
        user.setStripeSubscriptionId(stripeSubscriptionId);
        userRepository.save(user);
    }

    public void upgradeUserToBusiness(User user, String stripeCustomerId, String stripeSubscriptionId) {
        user.setSubscriptionTier(User.SubscriptionTier.BUSINESS);
        user.setGenerationsLimit(-1);
        user.setStripeCustomerId(stripeCustomerId);
        user.setStripeSubscriptionId(stripeSubscriptionId);
        userRepository.save(user);
    }

    public void downgradeUserToFree(User user) {
        user.setSubscriptionTier(User.SubscriptionTier.FREE);
        user.setGenerationsLimit(5);
        user.setGenerationsUsed(0);
        userRepository.save(user);
    }
}
