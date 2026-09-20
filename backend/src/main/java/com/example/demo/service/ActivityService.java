package com.example.demo.service;

import com.example.demo.entity.AssignedTask;
import com.example.demo.entity.MoodEntry;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.User;
import com.example.demo.repository.AssignedTaskRepository;
import com.example.demo.repository.MoodEntryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * ActivityService
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Aggregiert pro Tag der letzten 12 Monate, wie viele Aufgaben ein Patient
 * erledigt hat (Status COMPLETED, Zeitpunkt = AssignedTask.completedAt) und
 * wie viele Stimmungs-Einträge er angelegt hat (MoodEntry.createdAt). Ist
 * die gemeinsame Datengrundlage für:
 * - `PatientActivityController` (Patient sieht seine eigene Heatmap)
 * - `TherapistController` (Therapeut sieht die Heatmap eines betreuten
 *   Patienten, siehe `/api/therapist/patients/{id}/activity`)
 *
 * Design-Entscheidung
 * ----------------------------------------------------------------------------
 * Aus PatientActivityController extrahiert, damit die Zähllogik nicht
 * dupliziert wird - beide Controller übergeben lediglich einen anderen
 * `User` (den eingeloggten Patienten bzw. einen vom Therapeuten
 * ausgewählten, per Zugriffsprüfung freigegebenen Patienten).
 */
@Service
public class ActivityService {

    private static final int MONTHS_BACK = 12;

    private final AssignedTaskRepository assignedTaskRepository;
    private final MoodEntryRepository moodEntryRepository;

    public ActivityService(AssignedTaskRepository assignedTaskRepository,
                           MoodEntryRepository moodEntryRepository) {
        this.assignedTaskRepository = assignedTaskRepository;
        this.moodEntryRepository = moodEntryRepository;
    }

    public List<DayActivityDto> getActivity(User user) {
        LocalDate startDate = LocalDate.now().minusMonths(MONTHS_BACK);

        Map<LocalDate, Integer> completedTasksByDay = new HashMap<>();
        for (AssignedTask task : assignedTaskRepository.findByPatientAndStatus(user, TaskStatus.COMPLETED)) {
            if (task.getCompletedAt() == null) {
                continue;
            }

            LocalDate day = task.getCompletedAt().toLocalDate();

            if (!day.isBefore(startDate)) {
                completedTasksByDay.merge(day, 1, Integer::sum);
            }
        }

        Map<LocalDate, Integer> moodEntriesByDay = new HashMap<>();
        for (MoodEntry entry : moodEntryRepository.findByUserOrderByCreatedAtDesc(user)) {
            LocalDate day = entry.getCreatedAt().toLocalDate();

            if (!day.isBefore(startDate)) {
                moodEntriesByDay.merge(day, 1, Integer::sum);
            }
        }

        Map<LocalDate, DayActivityDto> combined = new TreeMap<>();

        for (LocalDate day : completedTasksByDay.keySet()) {
            combined.put(day, new DayActivityDto(day.toString(), completedTasksByDay.get(day), 0));
        }

        for (LocalDate day : moodEntriesByDay.keySet()) {
            int completed = completedTasksByDay.getOrDefault(day, 0);
            combined.put(day, new DayActivityDto(day.toString(), completed, moodEntriesByDay.get(day)));
        }

        return combined.values().stream().toList();
    }

    public record DayActivityDto(String date, int completedTasks, int moodEntries) {
    }
}