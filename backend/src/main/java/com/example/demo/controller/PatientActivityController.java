package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ActivityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * PatientActivityController
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Liefert die Datengrundlage für die GitHub-artige Aktivitäts-Heatmap auf
 * der Patienten-Startseite (HomeView -> TaskHeatmap-Komponente im Frontend)
 * für den eingeloggten Patienten selbst. Die eigentliche Zähllogik steckt in
 * `ActivityService`, die auch der Therapeuten-Endpunkt
 * (`TherapistController#getPatientActivity`) für die Heatmap eines
 * bestimmten Patienten wiederverwendet.
 */
@RestController
@RequestMapping("/api/patient/activity")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientActivityController {

    private final ActivityService activityService;
    private final UserRepository userRepository;

    public PatientActivityController(ActivityService activityService,
                                     UserRepository userRepository) {
        this.activityService = activityService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<ActivityService.DayActivityDto> getMyActivity(@RequestHeader("X-User-Id") Long userId) {
        User user = userRepository.findById(userId).orElseThrow();

        return activityService.getActivity(user);
    }
}
