package com.example.gtemp.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "project_screenshots")
public class ProjectScreenshot {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "image_url")
    private String imageUrl;

    // Getters and Setters
}