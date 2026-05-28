package com.example.demo.controller;

import com.example.demo.entity.MoodEntry;
import com.example.demo.entity.User;
import com.example.demo.repository.MoodEntryRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/moods")
@CrossOrigin(origins = "http://localhost:5173")
public class MoodEntryController {

    private final MoodEntryRepository moodEntryRepository;
    private final UserRepository userRepository;

    public MoodEntryController(MoodEntryRepository moodEntryRepository,
                               UserRepository userRepository) {
        this.moodEntryRepository = moodEntryRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public MoodEntry saveMood(@RequestBody MoodEntry moodEntry,
                              @RequestHeader("X-User-Id") Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow();

        moodEntry.setUser(user);
        moodEntry.setCreatedAt(LocalDateTime.now());

        return moodEntryRepository.save(moodEntry);
    }

    @GetMapping
    public List<MoodEntry> getMyMoods(@RequestHeader("X-User-Id") Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow();

        return moodEntryRepository.findByUserOrderByCreatedAtDesc(user);
    }
}