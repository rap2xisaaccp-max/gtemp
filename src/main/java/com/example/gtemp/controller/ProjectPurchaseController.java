package com.example.gtemp.controller;

import com.example.gtemp.model.Profile;
import com.example.gtemp.model.Project;
import com.example.gtemp.repository.ProfileRepository;
import com.example.gtemp.repository.ProjectRepository;
import com.example.gtemp.dto.PurchaseRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.example.gtemp.model.ProjectPurchase;
import com.example.gtemp.repository.PurchaseRepository;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class ProjectPurchaseController {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private ProjectRepository projectRepository;


    @Autowired
    private PurchaseRepository purchaseRepository;

    /**
     * Checks if a user already owns or has free access rights to a project item.
     */
    @GetMapping("/{projectId}/check-ownership")
public ResponseEntity<Boolean> checkOwnership(
        @PathVariable UUID projectId,
        @RequestParam String username) {
    
    Project project = projectRepository.findById(projectId).orElse(null);
    if (project == null) {
        return ResponseEntity.ok(false);
    }

    // 1. Free projects are automatically accessible
    if (project.getPrice() == null || project.getPrice() <= 0) {
        return ResponseEntity.ok(true);
    }

    // 2. Creators automatically own their assets
    if (project.getOwner() != null && username.equals(project.getOwner().getUsername())) {
        return ResponseEntity.ok(true);
    }

    // 3. FIX: Check if a purchase ledger row already exists in your DB
    boolean hasPurchasedBefore = purchaseRepository.existsByBuyerUsernameAndProjectId(username, projectId);
    if (hasPurchasedBefore) {
        return ResponseEntity.ok(true); // User gets it for free!
    }

    return ResponseEntity.ok(false);
}

    /**
     * Handles wallet deductions and transfers for digital asset purchases.
     */
    @PostMapping("/{projectId}/purchase")
    @Transactional 
    public ResponseEntity<?> purchaseProject(
            @PathVariable UUID projectId, 
            @RequestBody PurchaseRequest payload) {
            
        if (payload == null || payload.getBuyerUsername() == null || payload.getSellerUsername() == null) {
            return ResponseEntity.badRequest().body("Malformed request payload body received.");
        }

        if (purchaseRepository.existsByBuyerUsernameAndProjectId(payload.getBuyerUsername(), projectId)) {
            return ResponseEntity.badRequest().body("Transaction rejected: You already own this asset pack.");
        }

        Profile buyer = profileRepository.findByUsername(payload.getBuyerUsername()).orElse(null);
        Profile seller = profileRepository.findByUsername(payload.getSellerUsername()).orElse(null);
        
        if (buyer == null) {
            return ResponseEntity.badRequest().body("Purchasing user account profile context not found.");
        }
        if (seller == null) {
            return ResponseEntity.badRequest().body("Vendor/Asset owner account profile context not found.");
        }

        if (buyer.getUsername().equals(seller.getUsername())) {
            return ResponseEntity.badRequest().body("Transaction rejected: You cannot purchase your own asset pack.");
        }

        double transactionAmount = payload.getAmount();
        if (transactionAmount < 0) {
            return ResponseEntity.badRequest().body("Invalid transaction value amount.");
        }

        if (buyer.getWalletBalance() < transactionAmount) {
            return ResponseEntity.badRequest().body("Insufficient wallet balance to authorize asset transfer.");
        }

        buyer.setWalletBalance(buyer.getWalletBalance() - transactionAmount);
        seller.setWalletBalance(seller.getWalletBalance() + transactionAmount);

        profileRepository.save(buyer);
        profileRepository.save(seller);

        ProjectPurchase newPurchase = new ProjectPurchase(payload.getBuyerUsername(), projectId);
        purchaseRepository.save(newPurchase);

        return ResponseEntity.ok("Purchase transaction completed successfully.");
    }
}