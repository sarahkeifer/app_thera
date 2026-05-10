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

			// PATIENT
			if (userRepository.findByEmail("patient@test.de").isEmpty()) {

				User patient = new User();

				patient.setEmail("patient@test.de");
				patient.setPassword(passwordEncoder.encode("123456"));
				patient.setRole(Role.PATIENT);

				userRepository.save(patient);
			}

			// THERAPIST
			if (userRepository.findByEmail("therapist@test.de").isEmpty()) {

				User therapist = new User();

				therapist.setEmail("therapist@test.de");
				therapist.setPassword(passwordEncoder.encode("123456"));
				therapist.setRole(Role.THERAPIST);

				userRepository.save(therapist);
			}
		};
	}
}