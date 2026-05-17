package com.example.gtemp.model;

import jakarta.persistence.*;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_purchases")
public class ProjectPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String buyerUsername;
    private UUID projectId;
    private LocalDateTime purchaseDate;

    public ProjectPurchase() {}

    public ProjectPurchase(String buyerUsername, UUID projectId) {
        this.buyerUsername = buyerUsername;
        this.projectId = projectId;
        this.purchaseDate = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public String getBuyerUsername() { return buyerUsername; }
    public void setBuyerUsername(String buyerUsername) { this.buyerUsername = buyerUsername; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public LocalDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDateTime purchaseDate) { this.purchaseDate = purchaseDate; }
}