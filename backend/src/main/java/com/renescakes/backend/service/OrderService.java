package com.renescakes.backend.service;

import com.renescakes.backend.dto.OrderCreateRequest;
import com.renescakes.backend.model.Order;
import com.renescakes.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order createOrder(OrderCreateRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setEmail(request.getEmail());
        order.setPickupOrDelivery(request.getPickupOrDelivery());
        order.setAddress(request.getAddress());
        order.setDateNeeded(request.getDateNeeded());
        order.setNotes(request.getNotes());
        order.setCustomizationJson(request.getCustomizationJson());

        return orderRepository.save(order);
    }
}


