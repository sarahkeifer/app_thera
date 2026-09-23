package com.example.demo.controller;

import com.example.demo.entity.AssignedTask;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.TaskType;
import com.example.demo.entity.User;
import com.example.demo.repository.AssignedTaskRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/patient/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientTaskController {

    private final AssignedTaskRepository assignedTaskRepository;
    private final UserRepository userRepository;

    public PatientTaskController(AssignedTaskRepository assignedTaskRepository,
                                 UserRepository userRepository) {
        this.assignedTaskRepository = assignedTaskRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<PatientAssignedTaskDto> getMyTasks(@RequestHeader("X-User-Id") Long patientId) {
        User patient = userRepository.findById(patientId)
                .orElseThrow();

        return assignedTaskRepository.findByPatientOrderByAssignedAtDesc(patient).stream()
                .map(PatientAssignedTaskDto::from)
                .toList();
    }

    @PatchMapping("/{assignedTaskId}")
    public ResponseEntity<PatientAssignedTaskDto> updateStatus(
            @PathVariable Long assignedTaskId,
            @RequestBody UpdateStatusRequest request,
            @RequestHeader("X-User-Id") Long patientId
    ) {
        AssignedTask assignedTask = assignedTaskRepository.findById(assignedTaskId)
                .orElseThrow();

        if (!assignedTask.getPatient().getId().equals(patientId)) {
            return ResponseEntity.status(403).build();
        }

        assignedTask.setStatus(request.status());

        // completedAt ist die Datengrundlage der Task-Heatmap auf der
        // Startseite: nur beim (erneuten) Abschluss setzen, beim
        // Zuruecksetzen auf OPEN wieder leeren, damit ein Tag nicht faelsch-
        // licherweise als "erledigt" gezaehlt wird, wenn die Aufgabe danach
        // wieder geoeffnet wurde.
        if (request.status() == TaskStatus.COMPLETED) {
            assignedTask.setCompletedAt(LocalDateTime.now());
        } else {
            assignedTask.setCompletedAt(null);
        }

        assignedTaskRepository.save(assignedTask);

        return ResponseEntity.ok(PatientAssignedTaskDto.from(assignedTask));
    }

    @DeleteMapping("/{assignedTaskId}")
    public ResponseEntity<Void> deleteAssignedTask(
            @PathVariable Long assignedTaskId,
            @RequestHeader("X-User-Id") Long patientId
    ) {
        AssignedTask assignedTask = assignedTaskRepository.findById(assignedTaskId)
                .orElseThrow();

        if (!assignedTask.getPatient().getId().equals(patientId)) {
            return ResponseEntity.status(403).build();
        }

        assignedTaskRepository.delete(assignedTask);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{assignedTaskId}/file")
    public ResponseEntity<ByteArrayResource> downloadFile(
            @PathVariable Long assignedTaskId,
            @RequestHeader("X-User-Id") Long patientId
    ) {
        AssignedTask assignedTask = assignedTaskRepository.findById(assignedTaskId)
                .orElseThrow();

        if (!assignedTask.getPatient().getId().equals(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        return TaskController.fileResponse(assignedTask.getTaskTemplate());
    }

    public record PatientAssignedTaskDto(
            Long id,
            String title,
            String description,
            TaskType type,
            String duration,
            String category,
            String materials,
            String fileName,
            String dueDate,
            TaskStatus status,
            boolean templateDeleted
    ) {
        static PatientAssignedTaskDto from(AssignedTask assignedTask) {
            return new PatientAssignedTaskDto(
                    assignedTask.getId(),
                    assignedTask.getTaskTemplate().getTitle(),
                    assignedTask.getTaskTemplate().getDescription(),
                    assignedTask.getTaskTemplate().getType(),
                    assignedTask.getTaskTemplate().getDuration(),
                    assignedTask.getTaskTemplate().getCategory(),
                    assignedTask.getTaskTemplate().getMaterials(),
                    assignedTask.getTaskTemplate().getFileName(),
                    assignedTask.getDueDate() != null ? assignedTask.getDueDate().toString() : null,
                    assignedTask.getStatus(),
                    assignedTask.getTaskTemplate().isDeleted()
            );
        }
    }

    public record UpdateStatusRequest(TaskStatus status) {
    }
}
