package com.example.demo;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Bean
    CommandLineRunner initUsers(UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {

        return args -> {
            // THERAPIST
            User therapist = null;
            if (userRepository.findByEmail("therapist.demo@app.de").isEmpty()) {

                therapist = new User();

                therapist.setEmail("therapist.demo@app.de");
                therapist.setPassword(passwordEncoder.encode("TherapistDemo2026!"));
                therapist.setRole(Role.THERAPIST);

                userRepository.save(therapist);

            } else {
                therapist = userRepository
                        .findByEmail("therapist.demo@app.de")
                        .get();
            }
            String[] firstNames = {
                    "Anna", "Max", "Sarah", "Tom", "Mina",
                    "Lukas", "Lea", "Noah", "Emma", "Ben"
            };

            String[] lastNames = {
                    "Müller", "Schmidt", "Weber", "Fischer", "Kaya",
                    "Braun", "Hoffmann", "Wagner", "Becker", "Richter"
            };
            final User finalTherapist = therapist;
            
            for (int i = 1; i <= 10; i++) {
                final int index = i;
                String email = "patient" + index + ".demo@app.de";

                User patient = userRepository.findByEmail(email)
                        .orElseGet(() -> {
                            User newPatient = new User();

                            newPatient.setEmail(email);
                            newPatient.setPassword(passwordEncoder.encode("PatientDemo" + index + "!"));
                            newPatient.setRole(Role.PATIENT);
                            newPatient.setTherapist(finalTherapist);

                            return newPatient;
                        });

                patient.setFirstName(firstNames[index - 1]);
                patient.setLastName(lastNames[index - 1]);
                patient.setTherapist(finalTherapist);

                userRepository.save(patient);
            }
        };
    }
}