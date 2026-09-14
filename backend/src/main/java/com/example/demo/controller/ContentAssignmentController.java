package com.example.demo.controller;

import com.example.demo.entity.AssignedContent;
import com.example.demo.entity.ContentTopic;
import com.example.demo.entity.User;
import com.example.demo.repository.AssignedContentRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/therapist/content")
@CrossOrigin(origins = "http://localhost:5173")
public class ContentAssignmentController {

    private final AssignedContentRepository assignedContentRepository;
    private final UserRepository userRepository;

    public ContentAssignmentController(AssignedContentRepository assignedContentRepository,
                                       UserRepository userRepository) {
        this.assignedContentRepository = assignedContentRepository;
        this.userRepository = userRepository;
    }

    /**
     * Liefert für jedes Lerninhalte-Thema die Liste der Patienten-IDs, denen es
     * aktuell zugewiesen ist. Wird einmal geladen, damit die Zuweisen-Dialoge im
     * Frontend direkt wissen, welche Patienten schon ausgewählt sein sollen.
     */
    @GetMapping("/assignments")
    public Map<ContentTopic, List<Long>> getAllAssignments() {
        Map<ContentTopic, List<Long>> result = new EnumMap<>(ContentTopic.class);

        for (ContentTopic topic : ContentTopic.values()) {
            List<Long> patientIds = assignedContentRepository.findByContentKey(topic).stream()
                    .map(assignment -> assignment.getPatient().getId())
                    .toList();

            result.put(topic, patientIds);
        }

        return result;
    }

    /**
     * Setzt die Menge der Patienten, denen dieses Thema zugewiesen ist, auf genau
     * die übergebene Liste (Patienten, die fehlen, werden entfernt; neue werden
     * hinzugefügt).
     */
    @PutMapping("/{contentKey}/assignments")
    @Transactional
    public List<Long> setAssignments(@PathVariable ContentTopic contentKey,
                                     @RequestBody SetAssignmentsRequest request,
                                     @RequestHeader("X-User-Id") Long therapistId) {
        User therapist = userRepository.findById(therapistId)
                .orElseThrow();

        List<AssignedContent> existing = assignedContentRepository.findByContentKey(contentKey);

        for (AssignedContent assignment : existing) {
            if (!request.patientIds().contains(assignment.getPatient().getId())) {
                assignedContentRepository.delete(assignment);
            }
        }

        List<Long> alreadyAssignedIds = existing.stream()
                .map(assignment -> assignment.getPatient().getId())
                .toList();

        for (Long patientId : request.patientIds()) {
            if (!alreadyAssignedIds.contains(patientId)) {
                User patient = userRepository.findById(patientId)
                        .orElseThrow();

                AssignedContent assignment = new AssignedContent();
                assignment.setContentKey(contentKey);
                assignment.setPatient(patient);
                assignment.setAssignedBy(therapist);

                assignedContentRepository.save(assignment);
            }
        }

        return request.patientIds();
    }

    public record SetAssignmentsRequest(List<Long> patientIds) {
    }
}
