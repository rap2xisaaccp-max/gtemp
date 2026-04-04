//AuthController.java
package com.example.gtemp.controller;

import com.example.gtemp.model.LoginRequest;
import com.example.gtemp.model.Profile;
import com.example.gtemp.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private ProfileRepository profileRepository;

    @PostMapping("/login")
public String login(@RequestBody LoginRequest request) {
    // Try finding by username first, then by email
    Optional<Profile> user = profileRepository.findByUsername(request.getUsername())
            .or(() -> profileRepository.findByEmail(request.getUsername()));

    if (user.isPresent() && user.get().getPassword().equals(request.getPassword())) {
        return "Login successful";
    }

    return "Invalid credentials";
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
}