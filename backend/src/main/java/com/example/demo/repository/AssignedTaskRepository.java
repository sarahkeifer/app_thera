package com.example.demo.repository;

import com.example.demo.entity.AssignedTask;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.TaskTemplate;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignedTaskRepository extends JpaRepository<AssignedTask, Long> {
    List<AssignedTask> findByPatientOrderByAssignedAtDesc(User patient);

    long countByPatientAndStatus(User patient, TaskStatus status);

    List<AssignedTask> findByTaskTemplate(TaskTemplate taskTemplate);
}