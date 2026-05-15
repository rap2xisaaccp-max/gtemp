//AuthController.java
package com.example.gtemp.controller;

import com.example.gtemp.model.LoginRequest;
import com.example.gtemp.model.Profile;
import com.example.gtemp.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import java.util.Optional;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private ProfileRepository profileRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Profile> user = profileRepository.findByUsername(request.getUsername())
                .or(() -> profileRepository.findByEmail(request.getUsername()));

        if (user.isPresent() && user.get().getPassword().equals(request.getPassword())) {
            // Return the full user object so the frontend has the username and pic
            return ResponseEntity.ok(user.get());
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }

@PostMapping("/register")
public String register(@RequestBody Profile newUser) {
    // Check if username exists
    if (profileRepository.findByUsername(newUser.getUsername()).isPresent()) {
        return "Username already exists";
    }
    // Check if email exists
    if (profileRepository.findByEmail(newUser.getEmail()).isPresent()) {
        return "Email already registered";
    }
    
    profileRepository.save(newUser); 
    return "User registered successfully";
}

@PostMapping("/users/add-funds")
public ResponseEntity<?> addFunds(@RequestBody Map<String, Object> payload) {
    String username = (String) payload.get("username");
    
    // Convert the amount safely from the JSON payload
    Double amount;
    try {
        amount = Double.valueOf(payload.get("amount").toString());
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Invalid amount format");
    }

    // Find the profile using your existing repository
    Optional<Profile> profileOptional = profileRepository.findByUsername(username);

    if (profileOptional.isPresent()) {
        Profile profile = profileOptional.get();
        
        // Update balance (handling null if the user is new)
        double currentBalance = profile.getWalletBalance() != null ? profile.getWalletBalance() : 0.0;
        profile.setWalletBalance(currentBalance + amount);
        
        // Save the updated profile back to Supabase/DB
        profileRepository.save(profile);
        
        return ResponseEntity.ok("Successfully added $" + amount + ". New balance: $" + profile.getWalletBalance());
    }

    return ResponseEntity.status(404).body("User profile not found");
}
}
