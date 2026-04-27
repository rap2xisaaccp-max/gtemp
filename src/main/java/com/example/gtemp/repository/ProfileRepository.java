package com.example.gtemp.repository;

import com.example.gtemp.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByUsername(String username);
    // Add this line to support email lookups
    Optional<Profile> findByEmail(String email); 
}