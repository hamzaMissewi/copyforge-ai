package com.copyforge.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
public class GenerationLimitExceededException extends RuntimeException {

    private final int currentUsage;
    private final int limit;

    public GenerationLimitExceededException(int currentUsage, int limit) {
        super(String.format("Generation limit reached: %d/%d used. Please upgrade your plan.", currentUsage, limit));
        this.currentUsage = currentUsage;
        this.limit = limit;
    }

    public int getCurrentUsage() {
        return currentUsage;
    }

    public int getLimit() {
        return limit;
    }
}
