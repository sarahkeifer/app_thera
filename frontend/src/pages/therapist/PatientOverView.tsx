/**
 * PatientOverView (Therapeut)
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Zentrale Übersichtsseite für Therapeuten: tabellarische Liste aller
 * betreuten Patienten mit letzter Stimmung, Aufgabenstatus (aktiv/
 * erledigt) und nächstem Termin, inkl. Suche/Filterung per Namen/E-Mail und
 * einem Dialog zum direkten Zuweisen einer Aufgabe an einen Patienten.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - Lädt beim Mount parallel die Patientenübersicht sowie die verfügbaren
 *   Aufgaben-Vorlagen (für den Zuweisen-Dialog).
 * - `searchTerm` filtert clientseitig über Name/E-Mail, ohne erneuten
 *   Serverzugriff (Datenmenge ist pro Therapeut überschaubar).
 * - `AssignTaskToPatientModal`: separate, lokal gehaltene Komponente für
 *   den Zuweisungsdialog inkl. eigenem Formular- und Erfolgszustand
 *   (`assigned`), damit der Dialog nach erfolgreicher Zuweisung eine
 *   Bestätigung statt sofort zu schließen anzeigen kann.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolAlert, KolButton, KolCard, KolHeading, KolIcon,
 * KolInputDate, KolInputText), data/moods.ts.
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Die Patientenliste wird bewusst als natives, semantisches HTML-Table
 * (`<table>/<thead>/<tbody>`) umgesetzt und NICHT auf KoliBris
 * `kol-table-stateless`/`kol-table-stateful` umgestellt: Diese
 * KoliBri-Tabellenkomponenten erwarten ein daten-/schema-getriebenes API
 * (`_data` + Spaltendefinition), während hier pro Zeile individuell
 * zusammengesetzte Inhalte (Stimmungs-Icon + Label, mehrere Badges,
 * Aktions-Button) benötigt werden. Eine Umstellung wäre technisch möglich,
 * würde aber die bestehende, funktionierende Render-Logik grundlegend
 * umbauen (siehe Aufgabenstellung: "keine unnötigen Refactorings" /
 * "keine Änderungen an Business-Logik"). Empfehlung für ein Folge-Refactoring:
 * Spaltendefinition + benutzerdefinierte Zellen-Renderer über
 * `kol-table-stateless` nachbilden. Alle übrigen interaktiven Elemente
 * (Suche, Buttons, Icons, Formularfelder im Zuweisen-Dialog) nutzen
 * konsequent KoliBri-Komponenten.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Ab einer Viewport-Breite von 1100px (Layout-Maximalbreite von `#root`)
 * wird die Tabelle rein per CSS in ein Karten-Raster umgebaut: Jede
 * Tabellenzeile wird zu einer Patientenkarte (Name/E-Mail als Kopf, darunter
 * Stimmung, Aufgaben und Termin als Label-Wert-Zeilen, unten die beiden
 * Aktions-Buttons). Auf Tablets stehen die Karten in mehreren Spalten, auf
 * Smartphones untereinander. Die Labels der Zellen kommen aus den
 * `data-label`-Attributen der `<td>`-Elemente; die `role`-Attribute halten
 * die Tabellensemantik für Screenreader aufrecht, obwohl die Elemente per
 * `display: block/grid` dargestellt werden (Safari verwirft sie sonst).
 * Oberhalb von 1100px bleibt das klassische Tabellenlayout erhalten, das in
 * `.patient-table-card` weiterhin horizontal scrollbar ist. Das umschließende
 * `.patient-overview`-Padding sowie die Dialoge (`.task-modal`) passen sich
 * ebenfalls an kleine Displays an (siehe index.css, Abschnitt "Responsive").
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolAlert, KolButton, KolCard, KolHeading, KolIcon, KolInputDate,
 * KolInputText.
 */

import { useEffect, useState } from "react";
import {
    KolAlert,
    KolButton,
    KolCard,
    KolHeading,
    KolIcon,
    KolInputDate,
    KolInputText,
} from "@public-ui/react-v19";
import { getMoodByValue } from "../../data/moods";
import TaskHeatmap from "../../components/TaskHeatmap";

type PatientOverviewItem = {
    id: number;
    name: string;
    email: string;
    lastMood: number | null;
    lastMoodCreatedAt: string | null;
    activeTasks: number;
    completedTasks: number;
    nextSession: string | null;
};

type TaskTemplate = {
    id: number;
    title: string;
    description: string;
    type: string;
    duration: string;
    category: string;
};

export default function PatientOverView() {
    const [patients, setPatients] = useState<PatientOverviewItem[]>([]);
    const [tasks, setTasks] = useState<TaskTemplate[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [assigningPatient, setAssigningPatient] =
        useState<PatientOverviewItem | null>(null);
    const [viewingActivityFor, setViewingActivityFor] =
        useState<PatientOverviewItem | null>(null);
    const [loadError, setLoadError] = useState(false);

    const loadPatients = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/api/therapist/patients",
                {
                    headers: {
                        "X-User-Id": localStorage.getItem("userId") || "",
                    },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error("Patienten konnten nicht geladen werden.");
            }

            const data: PatientOverviewItem[] = await response.json();
            setPatients(data);
            setLoadError(false);
        } catch (error) {
            console.error("Fehler beim Laden der Patienten:", error);
            setLoadError(true);
        }
    };

    const loadTasks = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/api/therapist/tasks",
                {
                    headers: {
                        "X-User-Id": localStorage.getItem("userId") || "",
                    },
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error("Aufgaben konnten nicht geladen werden.");
            }

            const data: TaskTemplate[] = await response.json();
            setTasks(data);
        } catch (error) {
            console.error("Fehler beim Laden der Aufgaben:", error);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        let pending = false;

        const loadPatientsAutomatically = async () => {
            if (pending || document.hidden) {
                return;
            }

            pending = true;

            try {
                const response = await fetch(
                    "http://localhost:8080/api/therapist/patients",
                    {
                        headers: {
                            "X-User-Id": localStorage.getItem("userId") || "",
                        },
                        signal: controller.signal,
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Patienten konnten nicht geladen werden."
                    );
                }

                const data: PatientOverviewItem[] = await response.json();

                if (!controller.signal.aborted) {
                    setPatients(data);
                    setLoadError(false);
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error(
                        "Fehler bei der automatischen Aktualisierung:",
                        error
                    );
                    setLoadError(true);
                }
            } finally {
                pending = false;
            }
        };

        void loadPatientsAutomatically();

        const timer = window.setInterval(
            loadPatientsAutomatically,
            30000
        );

        window.addEventListener("focus", loadPatientsAutomatically);
        document.addEventListener(
            "visibilitychange",
            loadPatientsAutomatically
        );

        return () => {
            controller.abort();
            window.clearInterval(timer);
            window.removeEventListener(
                "focus",
                loadPatientsAutomatically
            );
            document.removeEventListener(
                "visibilitychange",
                loadPatientsAutomatically
            );
        };
    }, []);

    useEffect(() => {
        void loadTasks();
    }, []);

    const filteredPatients = patients.filter((patient) => {
        const search = searchTerm.toLowerCase();

        return (
            patient.name.toLowerCase().includes(search) ||
            patient.email.toLowerCase().includes(search)
        );
    });

    return (
        <div className="patient-overview">
            <KolHeading
                _level={1}
                _label="Patienten-Übersicht"
            />

            <p className="task-subtitle">
                {patients.length} aktive Patienten
            </p>

            <div className="task-pool-search-row">
                <KolInputText
                    _label="Patient suchen"
                    _hideLabel
                    _placeholder="Patient suchen..."
                    _value={searchTerm}
                    _on={{
                        onInput: (_event, value) =>
                            setSearchTerm(String(value)),
                    }}
                />
            </div>

            {loadError && (
                <KolAlert
                    _type="error"
                    _label="Aktualisierung fehlgeschlagen"
                >
                    Die Patientenübersicht konnte nicht aktualisiert
                    werden. Angezeigte Daten sind möglicherweise
                    veraltet. Die Aktualisierung wird automatisch
                    erneut versucht.
                </KolAlert>
            )}

            <KolCard
                _label=""
                className="history"
            >
                <div className="patient-table-card">
                    <table className="patient-table" role="table">
                        <thead role="rowgroup">
                        <tr role="row">
                            <th role="columnheader">Patient</th>
                            <th role="columnheader">Stimmung</th>
                            <th role="columnheader">Aufgaben</th>
                            <th role="columnheader">Nächster Termin</th>
                            <th role="columnheader">Aktivität</th>
                            <th role="columnheader">Aktionen</th>
                        </tr>
                        </thead>

                        <tbody role="rowgroup">
                        {filteredPatients.map((patient) => {
                            const mood = getMoodByValue(
                                patient.lastMood
                            );

                            return (
                                <tr key={patient.id} role="row">
                                    <td role="cell">
                                        <div className="patient-name-cell">
                                            <span className="patient-name">
                                                {patient.name}
                                            </span>

                                            <span className="patient-email">
                                                {patient.email}
                                            </span>
                                        </div>
                                    </td>

                                    <td role="cell" data-label="Stimmung">
                                        <div className="patient-mood">
                                            <span className="patient-mood-emoji">
                                                {mood && (
                                                    <KolIcon
                                                        _icons={mood.icon}
                                                        _label={mood.label}
                                                    />
                                                )}
                                            </span>

                                            {patient.lastMood !== null &&
                                            mood ? (
                                                <span>{mood.label}</span>
                                            ) : (
                                                <span>
                                                    Noch kein Eintrag
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td role="cell" data-label="Aufgaben">
                                        <div className="patient-tasks">
                                            <span className="patient-active">
                                                {patient.activeTasks}
                                            </span>

                                            <span>aktiv</span>

                                            <span>/</span>

                                            <span className="patient-done">
                                                {patient.completedTasks}
                                            </span>

                                            <span>erledigt</span>
                                        </div>
                                    </td>

                                    <td role="cell" data-label="Nächster Termin">
                                        {patient.nextSession ? (
                                            <time
                                                dateTime={
                                                    patient.nextSession
                                                }
                                            >
                                                {new Date(
                                                    patient.nextSession
                                                ).toLocaleString(
                                                    "de-DE",
                                                    {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}{" "}
                                                Uhr
                                            </time>
                                        ) : (
                                            "Kein Termin"
                                        )}
                                    </td>

                                    <td role="cell">
                                        <div className="patient-activity-button">
                                            <KolButton
                                                _label="Aktivität anzeigen"
                                                _variant="secondary"
                                                _icons="icofont icofont-fire-burn"
                                                _on={{
                                                    onClick: () =>
                                                        setViewingActivityFor(
                                                            patient
                                                        ),
                                                }}
                                            />
                                        </div>
                                    </td>

                                    <td role="cell">
                                        <div className="patient-assign-button">
                                            <KolButton
                                                _label="Aufgabe zuweisen"
                                                _variant="secondary"
                                                _on={{
                                                    onClick: () =>
                                                        setAssigningPatient(
                                                            patient
                                                        ),
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {filteredPatients.length === 0 && (
                    <p className="task-pool-empty">
                        Keine Patienten gefunden.
                    </p>
                )}
            </KolCard>

            {assigningPatient && (
                <AssignTaskToPatientModal
                    patient={assigningPatient}
                    tasks={tasks}
                    onClose={() => {
                        setAssigningPatient(null);
                        void loadPatients();
                    }}
                />
            )}

            {viewingActivityFor && (
                <PatientActivityModal
                    patient={viewingActivityFor}
                    onClose={() => setViewingActivityFor(null)}
                />
            )}
        </div>
    );
}

function AssignTaskToPatientModal({
                                      patient,
                                      tasks,
                                      onClose,
                                  }: {
    patient: PatientOverviewItem;
    tasks: TaskTemplate[];
    onClose: () => void;
}) {
    const [selectedTaskId, setSelectedTaskId] =
        useState<number | null>(null);

    const [dueDate, setDueDate] = useState("");
    const [assigned, setAssigned] = useState(false);
    const [assignError, setAssignError] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const handleAssign = async () => {
        if (!selectedTaskId || assigning) {
            return;
        }

        setAssigning(true);
        setAssignError(false);

        try {
            const response = await fetch(
                `http://localhost:8080/api/therapist/tasks/${selectedTaskId}/assign`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-User-Id":
                            localStorage.getItem("userId") || "",
                    },
                    body: JSON.stringify({
                        patientIds: [patient.id],
                        dueDate: dueDate || null,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Aufgabe konnte nicht zugewiesen werden."
                );
            }

            setAssigned(true);
        } catch (error) {
            console.error(
                "Fehler beim Zuweisen der Aufgabe:",
                error
            );
            setAssignError(true);
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="home-mood-overlay">
            <div className="task-modal">
                <KolCard
                    _label=""
                    className="dialog"
                >
                    <KolHeading
                        _level={2}
                        _label={`Aufgabe zuweisen an ${patient.name}`}
                    />

                    {assigned ? (
                        <p className="task-assign-success">
                            Aufgabe wurde zugewiesen.
                        </p>
                    ) : (
                        <>
                            {assignError && (
                                <KolAlert
                                    _type="error"
                                    _label="Zuweisung fehlgeschlagen"
                                >
                                    Die Aufgabe konnte nicht
                                    zugewiesen werden. Bitte
                                    versuchen Sie es erneut.
                                </KolAlert>
                            )}

                            <div className="task-form-field">
                                <label className="task-form-label">
                                    Aufgabe auswählen
                                </label>

                                <div className="task-assign-patient-list">
                                    {tasks.length === 0 ? (
                                        <p>
                                            Keine Aufgaben im Pool
                                            vorhanden.
                                        </p>
                                    ) : (
                                        tasks.map((task) => (
                                            <KolButton
                                                key={task.id}
                                                _label={task.title}
                                                className="task-assign-patient-btn"
                                                _variant={
                                                    selectedTaskId ===
                                                    task.id
                                                        ? "primary"
                                                        : "secondary"
                                                }
                                                _on={{
                                                    onClick: () =>
                                                        setSelectedTaskId(
                                                            task.id
                                                        ),
                                                }}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="task-form-field">
                                <label className="task-form-label">
                                    Fälligkeitsdatum (optional)
                                </label>

                                <KolInputDate
                                    _label="Fälligkeitsdatum"
                                    _hideLabel
                                    _type="date"
                                    // _value={dueDate}
                                    _on={{
                                        onInput: (_event, value) =>
                                            setDueDate(
                                                String(value)
                                            ),
                                    }}
                                />
                            </div>
                        </>
                    )}

                    <div className="mood-dialog-actions">
                        <KolButton
                            _label={
                                assigned
                                    ? "Schließen"
                                    : "Abbrechen"
                            }
                            _variant="secondary"
                            _on={{
                                onClick: onClose,
                            }}
                        />

                        {!assigned && (
                            <KolButton
                                _label={
                                    assigning
                                        ? "Zuweisen..."
                                        : "Zuweisen"
                                }
                                _disabled={
                                    !selectedTaskId || assigning
                                }
                                _on={{
                                    onClick: handleAssign,
                                }}
                            />
                        )}
                    </div>
                </KolCard>
            </div>
        </div>
    );
}

/**
 * PatientActivityModal
 * ----------------------------------------------------------------------------
 * Overlay, das die Aktivitäts-Heatmap (TaskHeatmap) eines einzelnen
 * Patienten zeigt - dieselbe Komponente wie auf der Patienten-Startseite,
 * hier über die `patientId`-Prop auf die Daten dieses einen Patienten
 * umgeschaltet (siehe TaskHeatmap.tsx). Nutzt dasselbe
 * `.home-mood-overlay`-Overlay-Muster wie AssignTaskToPatientModal, damit
 * beide Dialoge auf der Seite einheitlich aussehen.
 */
function PatientActivityModal({
                                  patient,
                                  onClose,
                              }: {
    patient: PatientOverviewItem;
    onClose: () => void;
}) {
    return (
        <div className="home-mood-overlay">
            <div className="task-modal">
                <KolCard _label="" className="dialog">
                    <TaskHeatmap
                        patientId={patient.id}
                        title={`Aktivität von ${patient.name}`}
                    />

                    <div className="mood-dialog-actions">
                        <KolButton
                            _label="Schließen"
                            _variant="secondary"
                            _on={{ onClick: onClose }}
                        />
                    </div>
                </KolCard>
            </div>
        </div>
    );
}
