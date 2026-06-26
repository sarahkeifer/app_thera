package com.example.demo.repository;

import com.example.demo.entity.MoodEntry;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MoodEntryRepository extends JpaRepository<MoodEntry, Long> {
    List<MoodEntry> findByUserOrderByCreatedAtDesc(User user);

    Optional<MoodEntry> findFirstByUserOrderByCreatedAtDesc(User user);
}