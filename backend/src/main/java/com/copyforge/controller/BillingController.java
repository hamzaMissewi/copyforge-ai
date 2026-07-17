package com.copyforge.controller;

import com.copyforge.entity.User;
import com.copyforge.service.StripeService;
import com.copyforge.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final StripeService stripeService;
    private final UserService userService;

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
    public ResponseEntity<?> handleWebhook(@RequestBody Map<String, Object> payload,
                                            @RequestHeader("Stripe-Signature") String signature) {
        // In production: verify webhook signature and handle events
        // String eventType = payload.get("type").toString();
        // if ("checkout.session.completed".equals(eventType)) { ... }
        // if ("customer.subscription.deleted".equals(eventType)) { ... }
        return ResponseEntity.ok(Map.of("received", true));
    }

    @GetMapping("/portal")
    public ResponseEntity<?> createPortal() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(Map.of(
            "url", "https://billing.stripe.com/p/session/placeholder"
        ));
    }
}
