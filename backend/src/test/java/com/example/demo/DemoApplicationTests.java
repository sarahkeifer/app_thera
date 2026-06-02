package com.example.demo;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.MoodEntryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DemoApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private MoodEntryRepository moodEntryRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void loginPatientWorks() throws Exception {
		User patient = new User();
		patient.setEmail("test.patient@app.de");
		patient.setPassword(passwordEncoder.encode("Test123!"));
		patient.setRole(Role.PATIENT);
		userRepository.save(patient);

		mockMvc.perform(post("/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
                            {
                              "email": "test.patient@app.de",
                              "password": "Test123!"
                            }
                        """))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("test.patient@app.de"))
				.andExpect(jsonPath("$.role").value("PATIENT"));
	}

	@Test
	void patientCanSaveMood() throws Exception {
		User patient = new User();
		patient.setEmail("mood.patient@app.de");
		patient.setPassword(passwordEncoder.encode("Test123!"));
		patient.setRole(Role.PATIENT);
		User savedPatient = userRepository.save(patient);

		mockMvc.perform(post("/api/moods")
						.header("X-User-Id", savedPatient.getId())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
                            {
                              "mood": 4,
                              "note": "Heute geht es mir gut"
                            }
                        """))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.mood").value(4))
				.andExpect(jsonPath("$.note").value("Heute geht es mir gut"));
	}

	@Test
	void patientCanOnlySeeOwnMoods() throws Exception {
		User patient1 = new User();
		patient1.setEmail("patient.one@app.de");
		patient1.setPassword(passwordEncoder.encode("Test123!"));
		patient1.setRole(Role.PATIENT);
		patient1 = userRepository.save(patient1);

		User patient2 = new User();
		patient2.setEmail("patient.two@app.de");
		patient2.setPassword(passwordEncoder.encode("Test123!"));
		patient2.setRole(Role.PATIENT);
		patient2 = userRepository.save(patient2);

		mockMvc.perform(post("/api/moods")
						.header("X-User-Id", patient1.getId())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
                            {
                              "mood": 5,
                              "note": "Patient 1 Stimmung"
                            }
                        """))
				.andExpect(status().isOk());

		mockMvc.perform(post("/api/moods")
						.header("X-User-Id", patient2.getId())
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
                            {
                              "mood": 1,
                              "note": "Patient 2 Stimmung"
                            }
                        """))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/moods")
						.header("X-User-Id", patient1.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].note").value("Patient 1 Stimmung"));
	}
}