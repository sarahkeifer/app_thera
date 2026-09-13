package com.example.demo;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AppointmentTests {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;

    private User user(String email) {
        var user = new User();
        user.setEmail(email);
        user.setPassword("test-password");
        return users.save(user);
    }

    @Test
    void savesBothTypesAndListsOnlyTheUsersAppointments() throws Exception {
        var owner = user("owner@example.test");
        var other = user("other@example.test");
        for (String type : new String[]{"PRACTICE", "DIGITAL"}) {
            mvc.perform(post("/api/appointments").header("X-User-Id", owner.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"startsAt\":\"" + LocalDateTime.now().plusDays(2).withHour(10).withMinute(15).withSecond(0).withNano(0) + "\",\"type\":\"" + type + "\"}"))
                    .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNumber())
                    .andExpect(jsonPath("$.type").value(type)).andExpect(jsonPath("$.user").doesNotExist());
        }
        mvc.perform(get("/api/appointments").header("X-User-Id", owner.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
        mvc.perform(get("/api/appointments").header("X-User-Id", other.getId()))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test
    void enforcesQuarterHourSlotsAndOpeningHours() throws Exception {
        var owner = user("slots@example.test");
        for (String time : new String[]{"07:45:00", "17:15:00", "10:10:00", "10:15:01", "10:15:00.001"}) {
            mvc.perform(post("/api/appointments").header("X-User-Id", owner.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"startsAt\":\"2099-01-01T" + time + "\",\"type\":\"PRACTICE\"}"))
                    .andExpect(status().isBadRequest());
        }
        for (String time : new String[]{"08:00:00", "08:15:00", "16:45:00", "17:00:00"}) {
            mvc.perform(post("/api/appointments").header("X-User-Id", owner.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"startsAt\":\"2099-01-01T" + time + "\",\"type\":\"DIGITAL\"}"))
                    .andExpect(status().isCreated());
        }
    }

    @Test
    void updatesAndDeletesOnlyOwnedAppointments() throws Exception {
        var owner = user("edit-owner@example.test");
        var other = user("edit-other@example.test");
        var result = mvc.perform(post("/api/appointments").header("X-User-Id", owner.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"startsAt\":\"2099-01-01T08:00:00\",\"type\":\"PRACTICE\"}"))
                .andExpect(status().isCreated()).andReturn();
        var id = new com.fasterxml.jackson.databind.ObjectMapper().readTree(result.getResponse().getContentAsString()).get("id").asLong();
        var body = "{\"startsAt\":\"2099-01-01T09:15:00\",\"type\":\"DIGITAL\"}";
        mvc.perform(put("/api/appointments/" + id).header("X-User-Id", other.getId())
                .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isForbidden());
        mvc.perform(delete("/api/appointments/" + id).header("X-User-Id", other.getId())).andExpect(status().isForbidden());
        mvc.perform(put("/api/appointments/" + id).header("X-User-Id", owner.getId())
                .contentType(MediaType.APPLICATION_JSON).content(body.replace("09:15", "09:10"))).andExpect(status().isBadRequest());
        mvc.perform(put("/api/appointments/" + id).header("X-User-Id", owner.getId())
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.type").value("DIGITAL"));
        mvc.perform(get("/api/appointments").header("X-User-Id", owner.getId()))
                .andExpect(jsonPath("$[0].startsAt").value("2099-01-01T09:15:00"));
        mvc.perform(delete("/api/appointments/" + id).header("X-User-Id", owner.getId())).andExpect(status().isNoContent());
        mvc.perform(get("/api/appointments").header("X-User-Id", owner.getId())).andExpect(content().json("[]"));
    }

    @Test
    void therapistSeesLatestCreatedUpcomingAppointmentOfAssignedPatients() throws Exception {
        var therapist = user("therapist-calendar@example.test");
        var patient = user("patient-calendar@example.test");
        patient.setTherapist(therapist);
        users.save(patient);
        var other = user("unassigned-calendar@example.test");
        for (String date : new String[]{"2099-01-01", "2099-02-01"}) {
            mvc.perform(post("/api/appointments").header("X-User-Id", patient.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"startsAt\":\"" + date + "T10:15:00\",\"type\":\"PRACTICE\"}"))
                    .andExpect(status().isCreated());
        }
        mvc.perform(post("/api/appointments").header("X-User-Id", other.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"startsAt\":\"2099-03-01T10:15:00\",\"type\":\"DIGITAL\"}"))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/therapist/patients").header("X-User-Id", therapist.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(patient.getId()))
                .andExpect(jsonPath("$[0].nextSession").value("2099-02-01T10:15"));
        mvc.perform(get("/api/therapist/patients").header("X-User-Id", other.getId()))
                .andExpect(content().json("[]"));
    }

    @Test
    void rejectsPastDatesAndMissingOrUnknownTypes() throws Exception {
        var owner = user("validation@example.test");
        for (String body : new String[]{
                "{\"startsAt\":\"2020-01-01T10:00:00\",\"type\":\"PRACTICE\"}",
                "{\"startsAt\":\"2099-01-01T10:00:00\"}",
                "{\"startsAt\":\"2099-01-01T10:00:00\",\"type\":\"ZOOM\"}"}) {
            mvc.perform(post("/api/appointments").header("X-User-Id", owner.getId())
                    .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
        }
    }
}
