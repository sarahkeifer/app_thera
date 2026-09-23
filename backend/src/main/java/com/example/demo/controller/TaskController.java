package com.example.demo.controller;

import com.example.demo.entity.AssignedTask;
import com.example.demo.entity.TaskTemplate;
import com.example.demo.entity.TaskType;
import com.example.demo.entity.User;
import com.example.demo.repository.AssignedTaskRepository;
import com.example.demo.repository.TaskTemplateRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/therapist/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private final TaskTemplateRepository taskTemplateRepository;
    private final AssignedTaskRepository assignedTaskRepository;
    private final UserRepository userRepository;

    public TaskController(TaskTemplateRepository taskTemplateRepository,
                          AssignedTaskRepository assignedTaskRepository,
                          UserRepository userRepository) {
        this.taskTemplateRepository = taskTemplateRepository;
        this.assignedTaskRepository = assignedTaskRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<TaskTemplateDto> getTaskPool() {
        return taskTemplateRepository.findByDeletedFalseOrderByCreatedAtDesc().stream()
                .map(TaskTemplateDto::from)
                .toList();
    }

    @PostMapping
    public TaskTemplateDto createTask(@RequestBody CreateTaskRequest request,
                                      @RequestHeader("X-User-Id") Long therapistId) {
        User therapist = userRepository.findById(therapistId)
                .orElseThrow();

        TaskTemplate template = new TaskTemplate();
        template.setTitle(request.title());
        template.setDescription(request.description());
        template.setType(request.type());
        template.setDuration(request.duration());
        template.setCategory(request.category());
        template.setMaterials(request.materials());
        template.setCreatedBy(therapist);

        return TaskTemplateDto.from(taskTemplateRepository.save(template));
    }

    @PostMapping("/{taskId}/assign")
    public List<AssignedTaskDto> assignTask(@PathVariable Long taskId,
                                            @RequestBody AssignTaskRequest request,
                                            @RequestHeader("X-User-Id") Long therapistId) {
        User therapist = userRepository.findById(therapistId)
                .orElseThrow();

        TaskTemplate template = taskTemplateRepository.findById(taskId)
                .orElseThrow();

        if (template.isDeleted()) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Diese Aufgabe wurde gelöscht und kann nicht mehr zugewiesen werden."
            );
        }

        LocalDate dueDate = (request.dueDate() != null && !request.dueDate().isBlank())
                ? LocalDate.parse(request.dueDate())
                : null;

        return request.patientIds().stream()
                .map(patientId -> {
                    User patient = userRepository.findById(patientId)
                            .orElseThrow();

                    AssignedTask assignedTask = new AssignedTask();
                    assignedTask.setTaskTemplate(template);
                    assignedTask.setPatient(patient);
                    assignedTask.setAssignedBy(therapist);
                    assignedTask.setDueDate(dueDate);

                    return AssignedTaskDto.from(assignedTaskRepository.save(assignedTask));
                })
                .toList();
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long taskId,
                           @RequestHeader("X-User-Id") Long therapistId) {
        userRepository.findById(therapistId)
                .orElseThrow();

        TaskTemplate template = taskTemplateRepository.findById(taskId)
                .orElseThrow();

        boolean hasAssignments = !assignedTaskRepository.findByTaskTemplate(template).isEmpty();

        if (hasAssignments) {
            // Die Vorlage bleibt für bereits zugewiesene Aufgaben (auch in Bearbeitung
            // befindliche) referenzierbar, damit Patienten sie weiterhin in ihrem
            // Aufgabenpool sehen und abgeben können. Sie verschwindet aber aus dem
            // Aufgaben-Pool des Therapeuten und kann nicht mehr neu zugewiesen werden.
            template.setDeleted(true);
            taskTemplateRepository.save(template);
        } else {
            taskTemplateRepository.delete(template);
        }
    }

    @PostMapping("/{taskId}/file")
    public TaskTemplateDto uploadFile(@PathVariable Long taskId,
                                      @RequestParam("file") MultipartFile file,
                                      @RequestHeader("X-User-Id") Long therapistId) throws IOException {
        TaskTemplate template = requireOwnTemplate(taskId, therapistId);

        if (!"application/pdf".equals(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nur PDF-Dateien sind erlaubt.");
        }

        template.setFileName(file.getOriginalFilename());
        template.setFileType(file.getContentType());
        template.setFileData(file.getBytes());

        return TaskTemplateDto.from(taskTemplateRepository.save(template));
    }

    @GetMapping("/{taskId}/file")
    public ResponseEntity<ByteArrayResource> downloadFileAsTherapist(
            @PathVariable Long taskId,
            @RequestHeader("X-User-Id") Long therapistId
    ) {
        TaskTemplate template = requireOwnTemplate(taskId, therapistId);
        return fileResponse(template);
    }

    @DeleteMapping("/{taskId}/file")
    public TaskTemplateDto deleteFile(@PathVariable Long taskId,
                                      @RequestHeader("X-User-Id") Long therapistId) {
        TaskTemplate template = requireOwnTemplate(taskId, therapistId);

        template.setFileName(null);
        template.setFileType(null);
        template.setFileData(null);

        return TaskTemplateDto.from(taskTemplateRepository.save(template));
    }

    // Lädt die Vorlage und prüft, dass sie zum anfragenden Therapeuten
    // gehört - wird von allen drei Datei-Endpunkten (Upload/Download/
    // Löschen) genutzt, damit ein Therapeut nicht auf die Anhänge fremder
    // Vorlagen zugreifen kann.
    private TaskTemplate requireOwnTemplate(Long taskId, Long therapistId) {
        TaskTemplate template = taskTemplateRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!template.getCreatedBy().getId().equals(therapistId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        return template;
    }

    static ResponseEntity<ByteArrayResource> fileResponse(TaskTemplate template) {
        if (template.getFileData() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Kein Anhang vorhanden.");
        }

        ByteArrayResource resource = new ByteArrayResource(template.getFileData());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(template.getFileName() != null ? template.getFileName() : "anhang.pdf")
                                .build()
                                .toString()
                )
                .body(resource);
    }

    public record TaskTemplateDto(
            Long id,
            String title,
            String description,
            TaskType type,
            String duration,
            String category,
            String materials,
            String fileName
    ) {
        static TaskTemplateDto from(TaskTemplate template) {
            return new TaskTemplateDto(
                    template.getId(),
                    template.getTitle(),
                    template.getDescription(),
                    template.getType(),
                    template.getDuration(),
                    template.getCategory(),
                    template.getMaterials(),
                    template.getFileName()
            );
        }
    }

    public record AssignedTaskDto(
            Long id,
            Long taskTemplateId,
            String taskTitle,
            Long patientId,
            String patientName,
            String dueDate,
            String status
    ) {
        static AssignedTaskDto from(AssignedTask assignedTask) {
            return new AssignedTaskDto(
                    assignedTask.getId(),
                    assignedTask.getTaskTemplate().getId(),
                    assignedTask.getTaskTemplate().getTitle(),
                    assignedTask.getPatient().getId(),
                    assignedTask.getPatient().getFirstName() + " " + assignedTask.getPatient().getLastName(),
                    assignedTask.getDueDate() != null ? assignedTask.getDueDate().toString() : null,
                    assignedTask.getStatus().toString()
            );
        }
    }

    public record CreateTaskRequest(
            String title,
            String description,
            TaskType type,
            String duration,
            String category,
            String materials
    ) {
    }

    public record AssignTaskRequest(
            List<Long> patientIds,
            String dueDate
    ) {
    }
}