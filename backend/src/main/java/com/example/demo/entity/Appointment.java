package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Appointment {
    public enum Type { PRACTICE, DIGITAL }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private LocalDateTime startsAt;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User user;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public LocalDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(LocalDateTime startsAt) { this.startsAt = startsAt; }
    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }
    public void setUser(User user) { this.user = user; }
}
