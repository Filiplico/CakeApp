package com.renescakes.backend.exception;

import org.springframework.http.HttpStatus;

/** The AI designer could not produce a design. Carries the HTTP status to answer with. */
public class CakeArtException extends RuntimeException {

    private final HttpStatus status;

    public CakeArtException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public CakeArtException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
