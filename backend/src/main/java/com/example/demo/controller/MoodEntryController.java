package com.example.demo.controller;

import com.example.demo.entity.MoodEntry;
import com.example.demo.repository.MoodEntryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moods")
@CrossOrigin(origins = "http://localhost:5173")
public class MoodEntryController {

    private final MoodEntryRepository moodEntryRepository;

    public MoodEntryController(MoodEntryRepository moodEntryRepository) {
        this.moodEntryRepository = moodEntryRepository;
    }

    @PostMapping
    public MoodEntry saveMood(@RequestBody MoodEntry moodEntry) {
        return moodEntryRepository.save(moodEntry);
    }

    @GetMapping
    public List<MoodEntry> getAllMoods() {
        return moodEntryRepository.findAll();
    }
}