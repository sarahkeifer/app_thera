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

			// 10 PATIENTS
			for (int i = 1; i <= 10; i++) {
				String email = "patient" + i + ".demo@app.de"; 	// für 1.Patient: patient1.demo@app.de

				if (userRepository.findByEmail(email).isEmpty()) {
					User patient = new User();

					patient.setEmail(email);
					patient.setPassword(passwordEncoder.encode("PatientDemo" + i + "!")); // für 1.Patient: PatientDemo1!
					patient.setRole(Role.PATIENT);

					// Beziehung setzen
					patient.setTherapist(therapist);
					userRepository.save(patient);
				}
			}
		};
	}
}