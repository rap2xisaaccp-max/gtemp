package com.example.gtemp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users") 
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false) // Added email constraint
    private String email;

    @Column(nullable = false)
    private String password;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; } // Added Getter
    public void setEmail(String email) { this.email = email; } // Added Setter
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}