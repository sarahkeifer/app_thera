import {useEffect, useState} from "react";
import {KolAlert, KolButton, KolCard, KolHeading} from "@public-ui/react-v19";
import { useEffect, useState } from "react";
import { KolButton, KolCard, KolHeading, KolIcon, KolInputDate, KolInputText } from "@public-ui/react-v19";
import { getMoodByValue } from "../../data/moods";

type PatientOverviewItem = {
    id: number;
    name: string;
    email: string;
    lastMood: number | null;
    lastMoodCreatedAt: string | null;
    activeTasks: number;
    completedTasks: number;
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
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        let pending = false;
        async function loadPatients() {
            if (pending || document.hidden) return;
            pending = true;
            try {
                const response = await fetch("http://localhost:8080/api/therapist/patients", {
                    headers: {"X-User-Id": localStorage.getItem("userId") || ""},
                    signal: controller.signal,
                    cache: "no-store",
                });
                if (!response.ok) throw new Error();
                const data: PatientOverviewItem[] = await response.json();
                if (!controller.signal.aborted) {
                    setPatients(data);
                    setLoadError(false);
                }
            } catch {
                if (!controller.signal.aborted) setLoadError(true);
            } finally {
                pending = false;
            }
        }
        void loadPatients();
        const timer = window.setInterval(loadPatients, 30000);
        window.addEventListener("focus", loadPatients);
        document.addEventListener("visibilitychange", loadPatients);
        return () => {
            controller.abort();
            window.clearInterval(timer);
            window.removeEventListener("focus", loadPatients);
            document.removeEventListener("visibilitychange", loadPatients);
        };
    const [tasks, setTasks] = useState<TaskTemplate[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [assigningPatient, setAssigningPatient] = useState<PatientOverviewItem | null>(null);

    const loadPatients = () => {
        fetch("http://localhost:8080/api/therapist/patients", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setPatients(data));
    };

    useEffect(() => {
        loadPatients();

        fetch("http://localhost:8080/api/therapist/tasks", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setTasks(data));
    }, []);

    const filteredPatients = patients.filter(
        (patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="patient-overview">
            <KolHeading _level={1} _label="Patienten-Übersicht" />

            <p className="task-subtitle">{patients.length} aktive Patienten</p>

            <div className="task-pool-search-row">
                <KolInputText
                    _label="Patient suchen"
                    _hideLabel
                    _placeholder="Patient suchen..."
                    _value={searchTerm}
                    _on={{ onInput: (_e, value) => setSearchTerm(String(value)) }}
                />
            </div>

            {loadError && <KolAlert _type="error" _label="Aktualisierung fehlgeschlagen">
                Die Patientenübersicht konnte nicht aktualisiert werden. Angezeigte Termine sind möglicherweise veraltet. Die Aktualisierung wird automatisch erneut versucht.
            </KolAlert>}
            <KolCard _label="" _variant="history">
            <KolCard _label="" className="history">
                <table className="patient-table">
                    <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Stimmung</th>
                        <th>Aufgaben</th>
                        <th>Aktionen</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredPatients.map((patient) => (
                        <tr key={patient.id}>
                            <td>
                                <div className="patient-name-cell">
                                    <span className="patient-name">{patient.name}</span>
                                    <span className="patient-email">{patient.email}</span>
                                </div>
                            </td>

                            <td>
                                <div className="patient-mood">
                                    <span className="patient-mood-emoji">
                                        {getMoodByValue(patient.lastMood) && (
                                            <KolIcon
                                                _icons={getMoodByValue(patient.lastMood)!.icon}
                                                _label={getMoodByValue(patient.lastMood)!.label}
                                            />
                                        )}
                                    </span>

                                    {patient.lastMood ? (
                                        <span>{getMoodByValue(patient.lastMood)?.label}</span>
                                    ) : (
                                        <span>Noch kein Eintrag</span>
                                    )}
                                </div>
                            </td>

                            <td>
                                <div className="patient-tasks">
                                    <span className="patient-active">{patient.activeTasks}</span>
                                    <span>aktiv</span>
                                    <span>/</span>
                                    <span className="patient-done">{patient.completedTasks}</span>
                                    <span>erledigt</span>
                                </div>
                            </td>

                            <td>
                                {patient.nextSession ? (
                                    <time dateTime={patient.nextSession}>
                                        {new Date(patient.nextSession).toLocaleString('de-DE', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })} Uhr
                                    </time>
                                ) : "Kein Termin"}
                            </td>

                            <td>
                                <div className="patient-assign-button">
                                    <KolButton
                                        _label="Aufgabe zuweisen"
                                        _variant="secondary"
                                        _on={{ onClick: () => setAssigningPatient(patient) }}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {filteredPatients.length === 0 && (
                    <p className="task-pool-empty">Keine Patienten gefunden.</p>
                )}
            </KolCard>

            {assigningPatient && (
                <AssignTaskToPatientModal
                    patient={assigningPatient}
                    tasks={tasks}
                    onClose={() => {
                        setAssigningPatient(null);
                        loadPatients();
                    }}
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
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [dueDate, setDueDate] = useState("");
    const [assigned, setAssigned] = useState(false);

    const handleAssign = async () => {
        if (!selectedTaskId) return;

        await fetch(`http://localhost:8080/api/therapist/tasks/${selectedTaskId}/assign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": localStorage.getItem("userId") || "",
            },
            body: JSON.stringify({ patientIds: [patient.id], dueDate: dueDate || null }),
        });

        setAssigned(true);
    };

    return (
        <div className="home-mood-overlay">
            <div className="task-modal">
                <KolCard _label="" className="dialog">
                    <KolHeading _level={2} _label={`Aufgabe zuweisen an ${patient.name}`} />

                    {assigned ? (
                        <p className="task-assign-success">Aufgabe wurde zugewiesen.</p>
                    ) : (
                        <>
                            <div className="task-form-field">
                                <label className="task-form-label">Aufgabe auswählen</label>

                                <div className="task-assign-patient-list">
                                    {tasks.length === 0 ? (
                                        <p>Keine Aufgaben im Pool vorhanden.</p>
                                    ) : (
                                        tasks.map((task) => (
                                            <KolButton
                                                key={task.id}
                                                _label={task.title}
                                                className="task-assign-patient-btn"
                                                _variant={selectedTaskId === task.id ? "primary" : "secondary"}
                                                _on={{ onClick: () => setSelectedTaskId(task.id) }}
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
                                    _on={{ onInput: (_e, value) => setDueDate(String(value)) }}
                                />
                            </div>
                        </>
                    )}

                    <div className="mood-dialog-actions">
                        <KolButton
                            _label={assigned ? "Schließen" : "Abbrechen"}
                            _variant="secondary"
                            _on={{ onClick: onClose }}
                        />

                        {!assigned && (
                            <KolButton
                                _label="Zuweisen"
                                _disabled={!selectedTaskId}
                                _on={{ onClick: handleAssign }}
                            />
                        )}
                    </div>
                </KolCard>
            </div>
        </div>
    );
}
