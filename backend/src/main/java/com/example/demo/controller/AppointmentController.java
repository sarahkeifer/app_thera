package com.example.demo.controller;

import com.example.demo.entity.Appointment;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {
    private final AppointmentRepository appointments;
    private final UserRepository users;

    public AppointmentController(AppointmentRepository appointments, UserRepository users) {
        this.appointments = appointments;
        this.users = users;
    }

    public record CreateAppointment(@NotNull @Future LocalDateTime startsAt, @NotNull Appointment.Type type) {}
    public record AppointmentResponse(Long id, LocalDateTime startsAt, Appointment.Type type) {
        static AppointmentResponse from(Appointment appointment) {
            return new AppointmentResponse(appointment.getId(), appointment.getStartsAt(), appointment.getType());
        }
    }

    @GetMapping
    public List<AppointmentResponse> list(@RequestHeader("X-User-Id") Long userId) {
        if (!users.existsById(userId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return appointments.findByUserIdOrderByStartsAtAsc(userId).stream().map(AppointmentResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse create(@RequestHeader("X-User-Id") Long userId, @Valid @RequestBody CreateAppointment request) {
        validateTime(request);
        var user = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var appointment = new Appointment();
        appointment.setUser(user);
        appointment.setStartsAt(request.startsAt());
        appointment.setType(request.type());
        return AppointmentResponse.from(appointments.save(appointment));
    }

    @PutMapping("/{id}")
    public AppointmentResponse update(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId,
                                      @Valid @RequestBody CreateAppointment request) {
        var appointment = ownedAppointment(id, userId);
        validateTime(request);
        appointment.setStartsAt(request.startsAt());
        appointment.setType(request.type());
        return AppointmentResponse.from(appointments.save(appointment));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        appointments.delete(ownedAppointment(id, userId));
    }

    private Appointment ownedAppointment(Long id, Long userId) {
        var appointment = appointments.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!appointment.getUser().getId().equals(userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return appointment;
    }

    private void validateTime(CreateAppointment request) {
        var time = request.startsAt().toLocalTime();
        if (time.isBefore(LocalTime.of(8, 0)) || time.isAfter(LocalTime.of(17, 0))
                || time.getMinute() % 15 != 0 || time.getSecond() != 0 || time.getNano() != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Termine sind von 08:00 bis 17:00 Uhr in 15-Minuten-Schritten möglich.");
        }
    }
}
