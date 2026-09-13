package com.example.demo.repository;

import com.example.demo.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserIdOrderByStartsAtAsc(Long userId);
    Optional<Appointment> findFirstByUserIdAndStartsAtGreaterThanEqualOrderByIdDesc(Long userId, LocalDateTime now);
}
