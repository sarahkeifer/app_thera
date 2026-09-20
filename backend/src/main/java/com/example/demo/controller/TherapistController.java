package com.example.demo.controller;

import com.example.demo.entity.MoodEntry;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.User;
import com.example.demo.repository.AssignedTaskRepository;
import com.example.demo.repository.MoodEntryRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/therapist")
@CrossOrigin(origins = "http://localhost:5173")
public class TherapistController {

    private final UserRepository userRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final AssignedTaskRepository assignedTaskRepository;
    private final AppointmentRepository appointmentRepository;
    private final ActivityService activityService;

    public TherapistController(
            UserRepository userRepository,
            MoodEntryRepository moodEntryRepository,
            AssignedTaskRepository assignedTaskRepository,
            AppointmentRepository appointmentRepository,
            ActivityService activityService
    ) {
        this.userRepository = userRepository;
        this.moodEntryRepository = moodEntryRepository;
        this.assignedTaskRepository = assignedTaskRepository;
        this.appointmentRepository = appointmentRepository;
        this.activityService = activityService;
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

                    long activeTasks = assignedTaskRepository
                            .countByPatientAndStatus(
                                    patient,
                                    TaskStatus.OPEN
                            );

                    long completedTasks = assignedTaskRepository
                            .countByPatientAndStatus(
                                    patient,
                                    TaskStatus.COMPLETED
                            );

                    var nextAppointment = appointmentRepository
                            .findFirstByUserIdAndStartsAtGreaterThanEqualOrderByStartsAtAsc(
                                    patient.getId(),
                                    now
                            )
                            .orElse(null);

                    return new TherapistPatientDto(
                            patient.getId(),
                            patient.getFirstName() + " " + patient.getLastName(),
                            patient.getEmail(),
                            lastMood != null ? lastMood.getMood() : null,
                            lastMood != null
                                    ? lastMood.getCreatedAt().toString()
                                    : null,
                            activeTasks,
                            completedTasks,
                            nextAppointment != null
                                    ? nextAppointment.getStartsAt().toString()
                                    : null
                    );
                })
                .toList();
    }

    /**
     * Aktivitäts-Heatmap eines einzelnen, vom Therapeuten betreuten
     * Patienten (siehe TaskHeatmap.tsx / PatientOverView: "Aktivität
     * anzeigen"-Button je Zeile). Nutzt dieselbe Zähllogik wie die
     * Patienten-eigene Heatmap (ActivityService), damit beide Ansichten
     * exakt dieselben Zahlen liefern.
     */
    @GetMapping("/patients/{patientId}/activity")
    public ResponseEntity<List<ActivityService.DayActivityDto>> getPatientActivity(
            @PathVariable Long patientId,
            @RequestHeader("X-User-Id") Long therapistId
    ) {
        User patient = userRepository.findById(patientId)
                .orElseThrow();

        // Zugriffsschutz: ein Therapeut darf nur die Heatmap seiner eigenen
        // Patient:innen sehen, nicht die beliebiger anderer User-IDs.
        if (patient.getTherapist() == null
                || !patient.getTherapist().getId().equals(therapistId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(activityService.getActivity(patient));
    }

    public record TherapistPatientDto(
            Long id,
            String name,
            String email,
            Integer lastMood,
            String lastMoodCreatedAt,
            long activeTasks,
            long completedTasks,
            String nextSession
    ) {
    }
}