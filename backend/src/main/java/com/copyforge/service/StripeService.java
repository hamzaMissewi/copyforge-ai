package com.copyforge.service;

import com.copyforge.entity.User;
import com.copyforge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.model.Customer;
import com.stripe.model.Subscription;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.BillingPortalSessionCreateParams;

import jakarta.annotation.PostConstruct;
import java.util.Map;

@Service
public class StripeService {

    private static final Logger log = LoggerFactory.getLogger(StripeService.class);

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${app.stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.stripe.price-pro-monthly:}")
    private String proPriceId;

    @Value("${app.stripe.price-business-monthly:}")
    private String businessPriceId;

    @Value("${app.stripe.success-url:}")
    private String successUrl;

    @Value("${app.stripe.cancel-url:}")
    private String cancelUrl;

    private final UserRepository userRepository;

    public StripeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        String normalizedKey = normalizedKey(stripeSecretKey);
        if (!normalizedKey.isBlank() && !normalizedKey.contains("placeholder")) {
            Stripe.apiKey = stripeSecretKey;
            log.info("Stripe SDK initialized successfully");
        } else {
            log.warn("Stripe API key is not configured. Payment features will use fallback mode.");
        }
    }

    public Map<String, String> createCheckoutSession(User user, String priceId) {
        String normalizedKey = normalizedKey(stripeSecretKey);
        if (normalizedKey.isBlank() || normalizedKey.contains("placeholder")) {
            log.warn("Stripe not configured, returning placeholder checkout session");
            return Map.of(
                "sessionId", "placeholder_session_id",
                "url", "#checkout-placeholder"
            );
        }

        try {
            String customerId = ensureStripeCustomer(user);

            SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomer(customerId)
                .addLineItem(SessionCreateParams.LineItem.builder()
                    .setPrice(priceId)
                    .setQuantity(1L)
                    .build())
                .putMetadata("userId", user.getId().toString())
                .putMetadata("email", user.getEmail());

            if (successUrl != null && !successUrl.isBlank()) {
                builder.setSuccessUrl(successUrl);
            }
            if (cancelUrl != null && !cancelUrl.isBlank()) {
                builder.setCancelUrl(cancelUrl);
            }

            Session session = Session.create(builder.build());

            return Map.of(
                "sessionId", session.getId(),
                "url", session.getUrl()
            );
        } catch (StripeException e) {
            log.error("Failed to create Stripe checkout session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create checkout session: " + e.getMessage());
        }
    }

    public Map<String, String> createPortalSession(User user) {
        String normalizedKey = normalizedKey(stripeSecretKey);
        if (normalizedKey.isBlank() || normalizedKey.contains("placeholder")) {
            return Map.of("url", "#portal-placeholder");
        }

        if (user.getStripeCustomerId() == null) {
            throw new RuntimeException("No Stripe customer ID found for user");
        }

        try {
            BillingPortalSessionCreateParams params = BillingPortalSessionCreateParams.builder()
                .setCustomer(user.getStripeCustomerId())
                .setReturnUrl(cancelUrl)
                .build();

            com.stripe.model.billingPortal.Session portalSession =
                com.stripe.model.billingPortal.Session.create(params);

            return Map.of("url", portalSession.getUrl());
        } catch (StripeException e) {
            log.error("Failed to create portal session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create billing portal session: " + e.getMessage());
        }
    }

    public void handleWebhookEvent(String eventType, Map<String, Object> data) {
        log.info("Processing Stripe webhook event: {}", eventType);

        switch (eventType) {
            case "checkout.session.completed" -> handleCheckoutCompleted(data);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(data);
            case "customer.subscription.deleted" -> handleSubscriptionDeleted(data);
            case "invoice.payment_failed" -> handlePaymentFailed(data);
            default -> log.info("Unhandled Stripe event type: {}", eventType);
        }
    }

    private void handleCheckoutCompleted(Map<String, Object> data) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> sessionData = (Map<String, Object>) data.get("object");
            String customerId = (String) sessionData.get("customer");
            String subscriptionId = (String) sessionData.get("subscription");
            String userIdStr = ((Map<String, String>) sessionData.get("metadata")).get("userId");

            if (userIdStr != null) {
                Long userId = Long.parseLong(userIdStr);
                userRepository.findById(userId).ifPresent(user -> {
                    String priceId = extractPriceId(sessionData);
                    if (proPriceId != null && proPriceId.equals(priceId)) {
                        upgradeUserToPro(user, customerId, subscriptionId);
                    } else if (businessPriceId != null && businessPriceId.equals(priceId)) {
                        upgradeUserToBusiness(user, customerId, subscriptionId);
                    }
                });
            }
        } catch (Exception e) {
            log.error("Error handling checkout.session.completed: {}", e.getMessage(), e);
        }
    }

    private void handleSubscriptionUpdated(Map<String, Object> data) {
        log.info("Subscription updated event received");
    }

    private void handleSubscriptionDeleted(Map<String, Object> data) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> subscriptionData = (Map<String, Object>) data.get("object");
            String customerId = (String) subscriptionData.get("customer");

            if (customerId != null) {
                userRepository.findByStripeCustomerId(customerId).ifPresent(this::downgradeUserToFree);
            }
        } catch (Exception e) {
            log.error("Error handling customer.subscription.deleted: {}", e.getMessage(), e);
        }
    }

    private void handlePaymentFailed(Map<String, Object> data) {
        log.warn("Payment failed event received");
    }

    public void upgradeUserToPro(User user, String stripeCustomerId, String stripeSubscriptionId) {
        user.setSubscriptionTier(User.SubscriptionTier.PRO);
        user.setGenerationsLimit(-1);
        user.setStripeCustomerId(stripeCustomerId);
        user.setStripeSubscriptionId(stripeSubscriptionId);
        userRepository.save(user);
        log.info("User {} upgraded to PRO", user.getEmail());
    }

    public void upgradeUserToBusiness(User user, String stripeCustomerId, String stripeSubscriptionId) {
        user.setSubscriptionTier(User.SubscriptionTier.BUSINESS);
        user.setGenerationsLimit(-1);
        user.setStripeCustomerId(stripeCustomerId);
        user.setStripeSubscriptionId(stripeSubscriptionId);
        userRepository.save(user);
        log.info("User {} upgraded to BUSINESS", user.getEmail());
    }

    public void downgradeUserToFree(User user) {
        user.setSubscriptionTier(User.SubscriptionTier.FREE);
        user.setGenerationsLimit(5);
        user.setGenerationsUsed(0);
        user.setStripeCustomerId(null);
        user.setStripeSubscriptionId(null);
        userRepository.save(user);
        log.info("User {} downgraded to FREE", user.getEmail());
    }

    private String ensureStripeCustomer(User user) throws StripeException {
        if (user.getStripeCustomerId() != null) {
            try {
                Customer.retrieve(user.getStripeCustomerId());
                return user.getStripeCustomerId();
            } catch (StripeException e) {
                log.warn("Existing Stripe customer not found, creating new one");
            }
        }

        CustomerCreateParams params = CustomerCreateParams.builder()
            .setEmail(user.getEmail())
            .setName(user.getName())
            .putMetadata("userId", user.getId().toString())
            .build();

        Customer customer = Customer.create(params);
        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);
        return customer.getId();
    }

    private String extractPriceId(Map<String, Object> sessionData) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> items = (Map<String, Object>) sessionData.get("items");
            if (items != null) {
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> data =
                    (java.util.List<Map<String, Object>>) items.get("data");
                if (data != null && !data.isEmpty()) {
                    return (String) data.get(0).get("price");
                }
            }
        } catch (Exception e) {
            log.error("Error extracting price ID from session", e);
        }
        return null;
    }

    private String normalizedKey(String key) {
        return key == null ? "" : key.trim();
    }
}
