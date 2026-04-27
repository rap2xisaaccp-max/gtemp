package com.example.gtemp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {
    @GetMapping("/")
    public String health() {
        return "Gtemp Backend is up and running!";
    }
}