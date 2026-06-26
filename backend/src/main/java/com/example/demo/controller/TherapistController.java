package com.example.demo.controller;

import com.example.demo.entity.MoodEntry;
import com.example.demo.entity.User;
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

    public TherapistController(UserRepository userRepository,
                               MoodEntryRepository moodEntryRepository) {
        this.userRepository = userRepository;
        this.moodEntryRepository = moodEntryRepository;
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

                    return new TherapistPatientDto(
                            patient.getId(),
                            patient.getFirstName() + " " + patient.getLastName(),
                            lastMood != null ? lastMood.getMood() : null,
                            lastMood != null ? lastMood.getCreatedAt().toString() : null
                    );
                })
                .toList();
    }

    public record TherapistPatientDto(
            Long id,
            String name,
            Integer lastMood,
            String lastMoodCreatedAt
    ) {
    }
}