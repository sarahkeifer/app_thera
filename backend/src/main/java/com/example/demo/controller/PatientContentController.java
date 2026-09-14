package com.example.demo.controller;

import com.example.demo.entity.AssignedContent;
import com.example.demo.entity.ContentTopic;
import com.example.demo.entity.User;
import com.example.demo.repository.AssignedContentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient/content")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientContentController {

    private final AssignedContentRepository assignedContentRepository;
    private final UserRepository userRepository;

    public PatientContentController(AssignedContentRepository assignedContentRepository,
                                    UserRepository userRepository) {
        this.assignedContentRepository = assignedContentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/assignments")
    public List<ContentTopic> getMyAssignedContent(@RequestHeader("X-User-Id") Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow();

        return assignedContentRepository.findByPatient(patient).stream()
                .map(AssignedContent::getContentKey)
                .toList();
    }
}
