package com.renescakes.backend.controller;

import com.renescakes.backend.dto.CakeArtRequest;
import com.renescakes.backend.service.CakeArtService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final CakeArtService cakeArtService;

    public AiController(CakeArtService cakeArtService) {
        this.cakeArtService = cakeArtService;
    }

    @PostMapping("/cake-art")
    public Map<String, String> generateCakeArt(@Valid @RequestBody CakeArtRequest request) {
        return Map.of("svg", cakeArtService.generateSvg(request.getPrompt(), request.getFrostingColor()));
    }
}
