package com.example.demo.repository;

import com.example.demo.entity.TaskTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, Long> {
    List<TaskTemplate> findAllByOrderByCreatedAtDesc();

    List<TaskTemplate> findByDeletedFalseOrderByCreatedAtDesc();

    java.util.Optional<TaskTemplate> findByTitle(String title);
}