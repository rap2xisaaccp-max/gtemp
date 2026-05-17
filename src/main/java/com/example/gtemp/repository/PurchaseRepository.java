package com.example.gtemp.repository;

import com.example.gtemp.model.ProjectPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PurchaseRepository extends JpaRepository<ProjectPurchase, UUID> {
    boolean existsByBuyerUsernameAndProjectId(String buyerUsername, UUID projectId);
}