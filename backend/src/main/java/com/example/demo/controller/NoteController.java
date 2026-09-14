package com.example.demo.controller;

import com.example.demo.entity.Note;
import com.example.demo.entity.User;
import com.example.demo.repository.NoteRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class NoteController {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteController(NoteRepository noteRepository,
                          UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Note createNote(@RequestBody Note note,
                           @RequestHeader("X-User-Id") Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow();

        note.setUser(user);
        note.setCreatedAt(LocalDateTime.now());
        note.setUpdatedAt(LocalDateTime.now());

        return noteRepository.save(note);
    }

    @GetMapping
    public List<Note> getMyNotes(@RequestHeader("X-User-Id") Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow();

        return noteRepository.findByUserOrderByUpdatedAtDesc(user);
    }

    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id,
                           @RequestBody Note updatedNote,
                           @RequestHeader("X-User-Id") Long userId) {

        Note note = noteRepository.findById(id)
                .orElseThrow();

        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Nicht erlaubt");
        }

        note.setTitle(updatedNote.getTitle());
        note.setContent(updatedNote.getContent());
        note.setUpdatedAt(LocalDateTime.now());

        return noteRepository.save(note);
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id,
                           @RequestHeader("X-User-Id") Long userId) {

        Note note = noteRepository.findById(id)
                .orElseThrow();

        if (!note.getUser().getId().equals(userId)) {
            throw new RuntimeException("Nicht erlaubt");
        }

        noteRepository.delete(note);
    }
}
