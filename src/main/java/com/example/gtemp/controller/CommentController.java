package com.example.gtemp.controller;

import com.example.gtemp.model.Comment;
import com.example.gtemp.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    // 1. GET all threaded comments for a project
    @GetMapping("/projects/{projectId}/comments")
    public List<Comment> getCommentsByProject(@PathVariable UUID projectId) {
        return commentRepository.findByProjectIdAndParentIsNull(projectId);
    }

    // 2. POST a new comment or reply
    @PostMapping("/comments")
    public Comment createComment(@RequestBody Comment comment) {
        // If it's a reply, make sure to associate the parent entity properly if a parent ID is sent
        if (comment.getParent() != null && comment.getParent().getId() != null) {
            Comment parentComment = commentRepository.findById(comment.getParent().getId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parentComment);
        }
        return commentRepository.save(comment);
    }

    
}