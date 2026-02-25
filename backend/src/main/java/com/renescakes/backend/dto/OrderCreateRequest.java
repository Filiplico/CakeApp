package com.renescakes.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class OrderCreateRequest {

    @NotBlank
    private String customerName;

    @NotBlank
    private String phone;

    @Email
    private String email;

    @NotBlank
    private String pickupOrDelivery;

    private String address;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNeeded;

    private String notes;

    private String customizationJson;

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPickupOrDelivery() {
        return pickupOrDelivery;
    }

    public void setPickupOrDelivery(String pickupOrDelivery) {
        this.pickupOrDelivery = pickupOrDelivery;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getDateNeeded() {
        return dateNeeded;
    }

    public void setDateNeeded(LocalDate dateNeeded) {
        this.dateNeeded = dateNeeded;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCustomizationJson() {
        return customizationJson;
    }

    public void setCustomizationJson(String customizationJson) {
        this.customizationJson = customizationJson;
    }
}

