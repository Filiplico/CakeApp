package com.renescakes.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CakeArtRequest {

    @NotBlank
    @Size(max = 200)
    private String prompt;

    @Pattern(regexp = "^#[0-9a-fA-F]{6}$")
    private String frostingColor;

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getFrostingColor() {
        return frostingColor;
    }

    public void setFrostingColor(String frostingColor) {
        this.frostingColor = frostingColor;
    }
}
