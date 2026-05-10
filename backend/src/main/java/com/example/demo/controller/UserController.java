package com.example.demo.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173"})
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        try {
            userService.register(user);
            return "Registrierung erfolgreich";

        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    @PostMapping("/login")
    public User login(@RequestBody User loginRequest) {
        return userService.login(loginRequest.getEmail(), loginRequest.getPassword());
    }
}