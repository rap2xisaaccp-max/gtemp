package com.example.gtemp.controller;

import com.example.gtemp.model.LoginRequest;
import com.example.gtemp.model.User;
import com.example.gtemp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
public String login(@RequestBody LoginRequest request) {
    // Try finding by username first, then by email
    Optional<User> user = userRepository.findByUsername(request.getUsername())
            .or(() -> userRepository.findByEmail(request.getUsername()));

    if (user.isPresent() && user.get().getPassword().equals(request.getPassword())) {
        return "Login successful";
    }

    return "Invalid credentials";
}

@PostMapping("/register")
public String register(@RequestBody User newUser) {
    // Check if username exists
    if (userRepository.findByUsername(newUser.getUsername()).isPresent()) {
        return "Username already exists";
    }
    // Check if email exists
    if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
        return "Email already registered";
    }
    
    userRepository.save(newUser); 
    return "User registered successfully";
}
}