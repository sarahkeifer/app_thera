package com.example.demo.controller;

import com.example.demo.entity.MoodEntry;
import com.example.demo.entity.User;
import com.example.demo.repository.MoodEntryRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.AppointmentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/therapist")
@CrossOrigin(origins = "http://localhost:5173")
public class TherapistController {
    private final UserRepository userRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final AppointmentRepository appointmentRepository;

    public TherapistController(UserRepository userRepository,
                               MoodEntryRepository moodEntryRepository,
                               AppointmentRepository appointmentRepository) {
        this.userRepository = userRepository;
        this.moodEntryRepository = moodEntryRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @GetMapping("/patients")
    public List<TherapistPatientDto> getMyPatients(
            @RequestHeader("X-User-Id") Long therapistId
    ) {
        User therapist = userRepository.findById(therapistId)
                .orElseThrow();

        List<User> patients = userRepository.findByTherapistId(therapist.getId());

        var now = LocalDateTime.now();
        return patients.stream()
                .map(patient -> {
                    MoodEntry lastMood = moodEntryRepository
                            .findFirstByUserOrderByCreatedAtDesc(patient)
                            .orElse(null);

                    var latestAppointment = appointmentRepository
                            .findFirstByUserIdAndStartsAtGreaterThanEqualOrderByIdDesc(patient.getId(), now)
                            .orElse(null);
                    return new TherapistPatientDto(
                            patient.getId(),
                            patient.getFirstName() + " " + patient.getLastName(),
                            lastMood != null ? lastMood.getMood() : null,
                            lastMood != null ? lastMood.getCreatedAt().toString() : null,
                            latestAppointment != null ? latestAppointment.getStartsAt().toString() : null
                    );
                })
                .toList();
    }

    public record TherapistPatientDto(
            Long id,
            String name,
            Integer lastMood,
            String lastMoodCreatedAt,
            String nextSession
    ) {
    }
}
