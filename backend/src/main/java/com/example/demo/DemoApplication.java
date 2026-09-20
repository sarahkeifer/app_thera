package com.example.demo;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.TaskTemplateRepository;
import com.example.demo.entity.TaskTemplate;
import com.example.demo.entity.TaskType;
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
                                TaskTemplateRepository taskTemplateRepository,
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

            // Feste Demo-Aufgaben: werden nur angelegt, wenn sie noch nicht existieren.
            // Dadurch bleiben sie über Neustarts erhalten und werden nicht bei jedem
            // Start dupliziert. Wird eine Vorlage bewusst gelöscht, wird sie nicht
            // automatisch wiederhergestellt.
            seedDefaultTaskTemplates(taskTemplateRepository, finalTherapist);
        };
    }


    private void seedDefaultTaskTemplates(TaskTemplateRepository repository, User therapist) {
        seedTask(repository, therapist,
                "Mein Tag in Reflexion",
                "Reflektiere deinen heutigen Tag. Was ist gut gelaufen und was möchtest du morgen verbessern?",
                TaskType.REFLECTION, "10 Minuten", "Persönliche Entwicklung",
                "Notizbuch oder digitale Notizen");

        seedTask(repository, therapist,
                "Mein Lernziel für diese Woche",
                "Definiere ein konkretes Lernziel und überlege, welche Schritte du dafür unternehmen musst.",
                TaskType.PSYCHOEDUCATION, "15 Minuten", "Planung", "Notizbuch");

        seedTask(repository, therapist,
                "25 Minuten konzentriert arbeiten",
                "Arbeite 25 Minuten ohne Ablenkung an einer wichtigen Aufgabe.",
                TaskType.ACTIVITY, "25 Minuten", "Produktivität", "Timer");

        seedTask(repository, therapist,
                "Ein neues Thema entdecken",
                "Informiere dich über ein neues Thema und notiere die drei wichtigsten Erkenntnisse.",
                TaskType.PSYCHOEDUCATION, "30 Minuten", "Wissen",
                "Internet, Buch oder Lernmaterial");

        seedTask(repository, therapist,
                "Meine Woche reflektieren",
                "Überlege, was du diese Woche erreicht hast, welche Herausforderungen es gab und was du nächste Woche anders machen möchtest.",
                TaskType.REFLECTION, "20 Minuten", "Persönliche Entwicklung",
                "Notizbuch oder digitale Notizen");

        seedTask(repository, therapist,
                "Atemübung für zwischendurch",
                "Nimm dir einige Minuten Zeit für eine ruhige, bewusste Atmung und beobachte, wie sich deine Aufmerksamkeit verändert.",
                TaskType.ACTIVITY, "5 Minuten", "Achtsamkeit", "Kein Material erforderlich");

        seedTask(repository, therapist,
                "Drei Dinge, die heute gut waren",
                "Notiere drei Dinge, die heute gut gelaufen sind oder für die du dankbar bist.",
                TaskType.REFLECTION, "5 Minuten", "Persönliche Entwicklung", "Notizbuch");

        seedTask(repository, therapist,
                "Meine wichtigsten Aufgaben planen",
                "Wähle bis zu drei wichtige Aufgaben für heute aus und lege eine sinnvolle Reihenfolge fest.",
                TaskType.ACTIVITY, "10 Minuten", "Planung", "Notizbuch oder digitale Notizen");

        seedTask(repository, therapist,
                "Eine Gewohnheit beobachten",
                "Beobachte eine Gewohnheit in deinem Alltag und notiere, wann sie auftritt und was sie auslöst.",
                TaskType.REFLECTION, "15 Minuten", "Selbstbeobachtung", "Notizbuch");

        seedTask(repository, therapist,
                "Eine Lernquelle vergleichen",
                "Nutze zwei unterschiedliche Quellen zu einem Thema und notiere, welche Informationen übereinstimmen oder sich unterscheiden.",
                TaskType.PSYCHOEDUCATION, "20 Minuten", "Wissen", "Internet oder Bücher");

        seedTask(repository, therapist,
                "Fünf Minuten ohne Ablenkung",
                "Lege Handy und andere Ablenkungen beiseite und widme dich fünf Minuten lang ausschließlich einer Aufgabe.",
                TaskType.ACTIVITY, "5 Minuten", "Produktivität", "Timer");

        seedTask(repository, therapist,
                "Was habe ich neu gelernt?",
                "Notiere drei Dinge, die du heute neu gelernt hast, und beschreibe kurz, warum sie interessant oder nützlich sind.",
                TaskType.REFLECTION, "10 Minuten", "Wissen", "Notizbuch oder digitale Notizen");

        seedTask(repository, therapist,
                "Mein Ziel in kleine Schritte teilen",
                "Wähle ein Ziel aus und zerlege es in drei bis fünf konkrete, realistische nächste Schritte.",
                TaskType.ACTIVITY, "15 Minuten", "Planung", "Notizbuch");

        seedTask(repository, therapist,
                "Kurze digitale Pause",
                "Verbringe zehn Minuten ohne Bildschirm und richte deine Aufmerksamkeit bewusst auf deine Umgebung.",
                TaskType.ACTIVITY, "10 Minuten", "Achtsamkeit", "Kein Material erforderlich");

        seedTask(repository, therapist,
                "Eine Herausforderung auswerten",
                "Denke an eine Herausforderung der letzten Tage zurück: Was war schwierig, was hat geholfen und was möchtest du beim nächsten Mal ausprobieren?",
                TaskType.REFLECTION, "15 Minuten", "Persönliche Entwicklung", "Notizbuch");

        seedTask(repository, therapist,
                "Pomodoro-Arbeitsblock",
                "Arbeite konzentriert für 25 Minuten an einer Aufgabe und mache anschließend eine kurze Pause.",
                TaskType.ACTIVITY, "30 Minuten", "Produktivität", "Timer");

        seedTask(repository, therapist,
                "Wissenskarte erstellen",
                "Fasse ein gelerntes Thema auf einer kleinen Wissenskarte mit Begriffen, Beispielen und den wichtigsten Punkten zusammen.",
                TaskType.PSYCHOEDUCATION, "20 Minuten", "Lernen", "Papier oder digitale Notizen");

        seedTask(repository, therapist,
                "Wochenziel überprüfen",
                "Prüfe dein aktuelles Wochenziel: Was ist bereits erledigt, was fehlt noch und was ist der nächste konkrete Schritt?",
                TaskType.REFLECTION, "10 Minuten", "Planung", "Notizbuch");
    }

    private void seedTask(TaskTemplateRepository repository,
                          User therapist,
                          String title,
                          String description,
                          TaskType type,
                          String duration,
                          String category,
                          String materials) {
        if (repository.findByTitle(title).isPresent()) {
            return;
        }

        TaskTemplate template = new TaskTemplate();
        template.setTitle(title);
        template.setDescription(description);
        template.setType(type);
        template.setDuration(duration);
        template.setCategory(category);
        template.setMaterials(materials);
        template.setCreatedBy(therapist);
        repository.save(template);
    }
}