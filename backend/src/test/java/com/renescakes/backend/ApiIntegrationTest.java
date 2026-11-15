package com.renescakes.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.renescakes.backend.repository.OrderRepository;
import com.renescakes.backend.repository.ProductRepository;
import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.test.web.servlet.MockMvc;

/** Exercises the public API end to end against the in-memory test database. */
@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DataSource dataSource;

    @Test
    void listsTheSeededCatalogue() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].name").value("Chocolate Birthday Cake"))
                .andExpect(jsonPath("$[0].priceFrom").value(4500));
    }

    @Test
    void seedScriptDoesNotDuplicateProductsWhenRunAgain() {
        // data.sql runs on every startup, so a second run must leave the catalogue unchanged.
        new ResourceDatabasePopulator(new ClassPathResource("data.sql")).execute(dataSource);

        assertThat(productRepository.count()).isEqualTo(4);
    }

    @Test
    void returnsOneProduct() throws Exception {
        mockMvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("BIRTHDAY"));
    }

    @Test
    void returns404ForAnUnknownProduct() throws Exception {
        mockMvc.perform(get("/api/products/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product not found with id 999"));
    }

    @Test
    void createsAnOrderWithStatusNew() throws Exception {
        long before = orderRepository.count();

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "customerName": "Anna Smith",
                                  "phone": "070 123 456",
                                  "pickupOrDelivery": "PICKUP",
                                  "dateNeeded": "2030-12-20",
                                  "customizationJson": "{\\"tiers\\":3}"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.customizationJson").value("{\"tiers\":3}"));

        assertThat(orderRepository.count()).isEqualTo(before + 1);
    }

    @Test
    void rejectsAnOrderWithMissingFields() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"customerName\": \"Anna\" }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.phone").exists())
                .andExpect(jsonPath("$.errors.pickupOrDelivery").exists())
                .andExpect(jsonPath("$.errors.dateNeeded").exists());
    }

    @Test
    void rejectsAnEmptyCakeArtPrompt() throws Exception {
        mockMvc.perform(post("/api/ai/cake-art")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"prompt\": \"\" }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.prompt").exists());
    }

    @Test
    void keepsNonPublicEndpointsLocked() throws Exception {
        mockMvc.perform(get("/api/orders")).andExpect(status().isUnauthorized());
    }
}
