//User.java
package com.example.gtemp.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "profiles") 
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) 
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false) // Added email constraint
    private String email;

    @Column(nullable = false)
    private String password;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; } // Added Getter
    public void setEmail(String email) { this.email = email; } // Added Setter
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}