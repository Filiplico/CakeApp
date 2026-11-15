package com.renescakes.backend.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.errors.AnthropicException;
import com.anthropic.models.beta.AnthropicBeta;
import com.anthropic.models.beta.messages.BetaFallbacksParam;
import com.anthropic.models.beta.messages.BetaMessage;
import com.anthropic.models.beta.messages.BetaOutputConfig;
import com.anthropic.models.beta.messages.BetaStopReason;
import com.anthropic.models.beta.messages.MessageCreateParams;
import com.renescakes.backend.exception.CakeArtException;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Turns a customer's description ("Happy 30th Anna, with gold stars") into an SVG
 * drawing that the cake builder wraps around the front of the 3D cake.
 */
@Service
public class CakeArtService {

    private static final Logger log = LoggerFactory.getLogger(CakeArtService.class);

    private static final String UNSUITABLE = "UNSUITABLE";
    private static final int MAX_SVG_LENGTH = 60_000;

    private static final String SYSTEM_PROMPT = """
            You are the decorator for a family bakery's online cake builder. A customer describes what \
            they would like on their cake, and you draw it as a single SVG. The bakery's website wraps \
            your drawing around the curved front of a 3D cake preview, where it appears quite small, \
            so it has to read clearly at a glance.

            Draw it the way it would be piped in icing or cut from fondant: bold, simple shapes, \
            rounded line caps and joins, lines at least 6 units thick, and no fine detail that would \
            disappear when the drawing is shrunk. Use three to five colours that stand out against the \
            frosting colour you are given, since the drawing sits directly on that frosting.

            If the customer wants words on the cake (a greeting, a name, an age), write those words \
            exactly as they gave them, using <text> elements with font-family="Georgia, 'Times New \
            Roman', serif", font-style="italic", text-anchor="middle" and a font size of at least 64, \
            split over two lines if that is what it takes to fit. Add a few small ornaments that suit \
            the message. If they describe a picture and no words, draw the picture without any text.

            Technical requirements, because the website rasterises your SVG onto a texture:
            - Root element: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">.
            - Leave the background transparent. Do not draw a background rectangle.
            - Centre the design and let it fill most of the canvas, keeping about 20 units of margin.
            - Style with presentation attributes (fill, stroke, stroke-width) only. <style> blocks, \
              scripts, animation, <image>, <foreignObject> and external references are stripped out.

            Reply with the SVG markup only, starting with <svg and ending with </svg>, with no \
            commentary and no code fences. If the request is not something a family bakery would put \
            on a cake, reply with the single word UNSUITABLE instead.""";

    private final String model;
    private volatile AnthropicClient client;

    public CakeArtService(@Value("${anthropic.model:claude-opus-5-5}") String model) {
        this.model = model;
    }

    public String generateSvg(String prompt, String frostingColor) {
        String userMessage = "Frosting colour behind the design: "
                + (frostingColor != null ? frostingColor : "#f6efe4")
                + "\nWhat the customer asked for: " + prompt.strip();

        MessageCreateParams params = MessageCreateParams.builder()
                .model(model)
                .maxTokens(16000L)
                // Low effort keeps the wait short for a customer watching the cake preview.
                .outputConfig(BetaOutputConfig.builder().effort(BetaOutputConfig.Effort.LOW).build())
                // If a safety classifier declines the request, the API retries it on a fallback model.
                .addBeta(AnthropicBeta.SERVER_SIDE_FALLBACK_2026_07_01)
                .fallbacks(BetaFallbacksParam.ofDefault())
                .system(SYSTEM_PROMPT)
                .addUserMessage(userMessage)
                .build();

        BetaMessage response;
        try {
            response = client().beta().messages().create(params);
        } catch (AnthropicException e) {
            log.warn("Cake art generation failed: {}", e.getMessage());
            throw new CakeArtException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The AI designer is not available right now.", e);
        }

        boolean refused = response.stopReason().map(BetaStopReason.REFUSAL::equals).orElse(false);
        String text = response.content().stream()
                .flatMap(block -> block.text().stream())
                .map(block -> block.text())
                .collect(Collectors.joining())
                .strip();

        if (refused || text.startsWith(UNSUITABLE)) {
            throw new CakeArtException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "We can't put that on a cake. Try describing something else.");
        }

        int start = text.indexOf("<svg");
        int end = text.lastIndexOf("</svg>");
        if (start < 0 || end < start || end - start > MAX_SVG_LENGTH) {
            log.warn("Cake art response was not a usable SVG (stop reason {})", response.stopReason());
            throw new CakeArtException(HttpStatus.BAD_GATEWAY, "The AI designer returned a design we could not use.");
        }
        return text.substring(start, end + "</svg>".length());
    }

    /**
     * Built on first use so the application still starts when no Anthropic credentials
     * are configured. Credentials come from the environment (ANTHROPIC_API_KEY).
     */
    private AnthropicClient client() {
        AnthropicClient current = client;
        if (current == null) {
            synchronized (this) {
                current = client;
                if (current == null) {
                    try {
                        current = AnthropicOkHttpClient.fromEnv();
                    } catch (RuntimeException e) {
                        throw new CakeArtException(HttpStatus.SERVICE_UNAVAILABLE,
                                "The AI designer is not set up yet.", e);
                    }
                    client = current;
                }
            }
        }
        return current;
    }
}
