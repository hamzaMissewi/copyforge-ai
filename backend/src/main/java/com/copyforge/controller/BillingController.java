package com.copyforge.controller;

import com.copyforge.entity.User;
import com.copyforge.service.StripeService;
import com.copyforge.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private static final Logger log = LoggerFactory.getLogger(BillingController.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private final StripeService stripeService;
    private final UserService userService;

    @Value("${app.stripe.webhook-secret:}")
    private String webhookSecret;

    public BillingController(StripeService stripeService, UserService userService) {
        this.stripeService = stripeService;
        this.userService = userService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckout(@RequestBody Map<String, String> request) {
        User user = userService.getCurrentUser();
        String priceId = request.get("priceId");
        Map<String, String> session = stripeService.createCheckoutSession(user, priceId);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody String payload,
                                            @RequestHeader(value = "Stripe-Signature",
                                                required = false) String signature) {
        if (webhookSecret != null && !webhookSecret.isBlank() && signature != null) {
            try {
                com.stripe.net.Webhook.constructEvent(payload, signature, webhookSecret);
            } catch (com.stripe.exception.SignatureVerificationException e) {
                log.error("Stripe webhook signature verification failed: {}", e.getMessage());
                return ResponseEntity.status(400).body(Map.of("error", "Invalid signature"));
            } catch (Exception e) {
                log.error("Error verifying webhook signature: {}", e.getMessage());
            }
        }

        try {
            Map<String, Object> topLevel = mapper.readValue(payload, Map.class);
            String eventType = (String) topLevel.get("type");
            if (eventType != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) topLevel.get("data");
                if (data != null) {
                    stripeService.handleWebhookEvent(eventType, data);
                }
            }
            return ResponseEntity.ok(Map.of("received", true));
        } catch (Exception e) {
            log.error("Failed to parse webhook payload: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("received", true));
        }
    }

    @GetMapping("/portal")
    public ResponseEntity<?> createPortal() {
        User user = userService.getCurrentUser();
        Map<String, String> portalSession = stripeService.createPortalSession(user);
        return ResponseEntity.ok(portalSession);
    }
}
