package com.example.gtemp.repository;

import com.example.gtemp.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    // Fetch only top-level comments for a specific project
    List<Comment> findByProjectIdAndParentIsNull(UUID projectId);
}