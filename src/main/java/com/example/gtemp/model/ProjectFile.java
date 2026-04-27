package com.example.gtemp.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "project_files")
public class ProjectFile {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_name")
    private String fileName;

    // Getters and Setters
}