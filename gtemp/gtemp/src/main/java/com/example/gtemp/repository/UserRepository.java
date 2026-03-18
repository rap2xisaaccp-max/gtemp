package com.example.gtemp.repository;

import com.example.gtemp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    // Add this line to support email lookups
    Optional<User> findByEmail(String email); 
}