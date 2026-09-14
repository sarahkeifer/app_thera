package com.example.demo.repository;

import com.example.demo.entity.AssignedContent;
import com.example.demo.entity.ContentTopic;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignedContentRepository extends JpaRepository<AssignedContent, Long> {
    List<AssignedContent> findByPatient(User patient);

    List<AssignedContent> findByContentKey(ContentTopic contentKey);
}
