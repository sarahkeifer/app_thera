package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_templates")
public class TaskTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Titel darf nicht leer sein")
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private TaskType type;

    private String duration;

    private String category;

    private String materials;

    // PDF-Anhang. Bewusst direkt in der Datenbank gespeichert (statt im
    // Dateisystem/Objektspeicher) - passt zur bestehenden H2/Postgres-
    // Konfiguration ohne zusätzliche Infrastruktur, und bei den zu
    // erwartenden Dateigrößen (Arbeitsblätter, max. 10 MB, siehe
    // application.properties) ist das unproblematisch. fileName ist
    // zugleich der Indikator "hat diese Vorlage einen Anhang?" (null =
    // kein Anhang) und wird deshalb an die DTOs durchgereicht, ohne die
    // eigentlichen Bytes (fileData) unnötig mitzuschicken.
    private String fileName;

    private String fileType;

    @Lob
    private byte[] fileData;

    @Column(nullable = false)
    @ColumnDefault("false")
    private boolean deleted = false;

    @ManyToOne
    private User createdBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskType getType() {
        return type;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMaterials() {
        return materials;
    }

    public void setMaterials(String materials) {
        this.materials = materials;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public byte[] getFileData() {
        return fileData;
    }

    public void setFileData(byte[] fileData) {
        this.fileData = fileData;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}