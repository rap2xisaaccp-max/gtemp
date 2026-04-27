package com.example.gtemp.model;

import jakarta.persistence.*;
import java.util.UUID;
import java.util.List;
import java.time.OffsetDateTime;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "owner_id", referencedColumnName = "id")
private Profile owner;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "main_screenshot")
    private String mainScreenshot;

    private String engine;

    private Double price;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id") // Links to the project_id column in project_screenshots
    private List<ProjectScreenshot> screenshots;

    // 1:N Relationship for Files
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id") // Links to the project_id column in project_files
    private List<ProjectFile> files;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "projects_genres", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "genre")
    private List<String> genres;

    @Column(name = "rating_avg")
    private Double ratingAvg = 0.0;

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @Column(name = "download_count")
    private Integer downloadCount = 0;

    @Column(name = "release_date")
    private OffsetDateTime releaseDate;

    // Getters and Setters
    public UUID getId() { return id; }
    public Profile getOwner() { return owner; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getMainScreenshot() { return mainScreenshot; }
    public String getEngine() { return engine; }
    public List<String> getGenres() { return genres; }
    public Double getPrice() { return price; }
    public Double getRatingAvg() { return ratingAvg; }
    public Integer getRatingCount() { return ratingCount; }
    public Integer getDownloadCount() { return downloadCount; }
    public List<ProjectScreenshot> getScreenshots() { return screenshots; }
    public List<ProjectFile> getFiles() { return files; }
}