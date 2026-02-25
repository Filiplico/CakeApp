package com.renescakes.backend.service;

import com.renescakes.backend.exception.NotFoundException;
import com.renescakes.backend.model.Product;
import com.renescakes.backend.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(Long id) {
        return productRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found with id " + id));
    }
}

