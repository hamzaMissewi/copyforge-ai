package com.copyforge.config;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimiter {

    private final Map<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private static final int MAX_GENERATE_PER_MINUTE = 5;

    public boolean tryAcquire(String key) {
        return tryAcquire(key, MAX_REQUESTS_PER_MINUTE);
    }

    public boolean tryAcquire(String key, int maxRequests) {
        RateLimitBucket bucket = buckets.compute(key, (k, existing) -> {
            if (existing == null || existing.isExpired()) {
                return new RateLimitBucket(maxRequests);
            }
            return existing;
        });
        return bucket.tryConsume();
    }

    private static class RateLimitBucket {
        private final AtomicInteger remaining;
        private final long windowStart;

        RateLimitBucket(int maxRequests) {
            this.remaining = new AtomicInteger(maxRequests);
            this.windowStart = System.currentTimeMillis();
        }

        boolean tryConsume() {
            return remaining.decrementAndGet() >= 0;
        }

        boolean isExpired() {
            return System.currentTimeMillis() - windowStart > 60_000;
        }
    }
}
