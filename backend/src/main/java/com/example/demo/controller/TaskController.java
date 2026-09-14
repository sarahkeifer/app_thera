package com.example.demo.controller;

import com.example.demo.entity.AssignedTask;
import com.example.demo.entity.TaskTemplate;
import com.example.demo.entity.TaskType;
import com.example.demo.entity.User;
import com.example.demo.repository.AssignedTaskRepository;
import com.example.demo.repository.TaskTemplateRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    public record TaskTemplateDto(
            Long id,
            String title,
            String description,
            TaskType type,
            String duration,
            String category,
            String materials
    ) {
        static TaskTemplateDto from(TaskTemplate template) {
            return new TaskTemplateDto(
                    template.getId(),
                    template.getTitle(),
                    template.getDescription(),
                    template.getType(),
                    template.getDuration(),
                    template.getCategory(),
                    template.getMaterials()
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