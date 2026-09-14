package com.example.demo.controller;

import com.example.demo.entity.MoodEntry;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.User;
import com.example.demo.repository.AssignedTaskRepository;
import com.example.demo.repository.MoodEntryRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/therapist")
@CrossOrigin(origins = "http://localhost:5173")
public class TherapistController {
    private final UserRepository userRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final AssignedTaskRepository assignedTaskRepository;

    public TherapistController(UserRepository userRepository,
                               MoodEntryRepository moodEntryRepository,
                               AssignedTaskRepository assignedTaskRepository) {
        this.userRepository = userRepository;
        this.moodEntryRepository = moodEntryRepository;
        this.assignedTaskRepository = assignedTaskRepository;
    }

    @GetMapping("/patients")
    public List<TherapistPatientDto> getMyPatients(
            @RequestHeader("X-User-Id") Long therapistId
    ) {
        User therapist = userRepository.findById(therapistId)
                .orElseThrow();

        List<User> patients = userRepository.findByTherapistId(therapist.getId());

        return patients.stream()
                .map(patient -> {
                    MoodEntry lastMood = moodEntryRepository
                            .findFirstByUserOrderByCreatedAtDesc(patient)
                            .orElse(null);

                    long activeTasks = assignedTaskRepository
                            .countByPatientAndStatus(patient, TaskStatus.OPEN);
                    long completedTasks = assignedTaskRepository
                            .countByPatientAndStatus(patient, TaskStatus.COMPLETED);

                    return new TherapistPatientDto(
                            patient.getId(),
                            patient.getFirstName() + " " + patient.getLastName(),
                            patient.getEmail(),
                            lastMood != null ? lastMood.getMood() : null,
                            lastMood != null ? lastMood.getCreatedAt().toString() : null,
                            activeTasks,
                            completedTasks
                    );
                })
                .toList();
    }

    public record TherapistPatientDto(
            Long id,
            String name,
            String email,
            Integer lastMood,
            String lastMoodCreatedAt,
            long activeTasks,
            long completedTasks
    ) {
    }
}