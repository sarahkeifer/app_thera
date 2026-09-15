/**
 * ContentPoolView (Therapeut)
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Übersicht der Lerninhalte-Themen (Krankheiten/Therapieformen) für
 * Therapeuten inkl. Anzeige, wie vielen Patienten ein Thema bereits
 * zugewiesen ist, sowie ein Dialog zur (Mehrfach-)Zuweisung eines Themas an
 * Patienten.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - `loadAssignments()`: lädt die aktuelle Zuweisungs-Zuordnung
 *   (Themen-Schlüssel → Patienten-IDs) vom Backend.
 * - `renderTopicGrid(category)`: gemeinsame Render-Funktion für die beiden
 *   Themen-Kategorien, um Duplikation zwischen "Krankheiten"- und
 *   "Therapieformen"-Abschnitt zu vermeiden.
 * - `AssignContentModal`: lokale Komponente zur Mehrfachauswahl von
 *   Patienten für ein Thema; speichert die komplette Auswahl atomar per
 *   `PUT` (ersetzt die bisherige Zuweisungsliste für dieses Thema).
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolButton, KolCard, KolHeading), data/contentTopics.ts.
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Die statischen Lerninhalte-Themen kommen aus `data/contentTopics.ts`
 * (kein eigener Backend-Abruf für die Themen selbst), da diese Inhalte
 * fest in der Anwendung hinterlegt sind; nur die Zuweisungen sind
 * dynamisch. Die Patientenauswahl im Zuweisen-Dialog nutzt – konsistent
 * zu `TaskPoolView`/`PatientOverView` – Toggle-`KolButton`s statt einer
 * Multi-Select-Liste, um Auswahl/Abwahl mit einem Klick zu ermöglichen.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Das Themen-Raster teilt sich die responsive Grid-Klasse
 * `.task-pool-grid` mit `TaskPoolView` (`repeat(auto-fill,
 * minmax(280px, 1fr))`), wodurch sich die Spaltenanzahl automatisch an
 * Desktop-, Tablet- und Mobile-Breiten anpasst.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolCard, KolHeading.
 */

import { useEffect, useState } from "react";
import { KolButton, KolCard, KolHeading } from "@public-ui/react-v19";
import { contentTopics, type ContentTopic } from "../../data/contentTopics";

type Patient = {
    id: number;
    name: string;
};

type AssignmentsMap = Record<string, number[]>;

export default function ContentPoolView() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [assignments, setAssignments] = useState<AssignmentsMap>({});
    const [assigningTopic, setAssigningTopic] = useState<ContentTopic | null>(null);

    const loadAssignments = () => {
        fetch("http://localhost:8080/api/therapist/content/assignments", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setAssignments(data));
    };

    useEffect(() => {
        loadAssignments();

        fetch("http://localhost:8080/api/therapist/patients", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setPatients(data));
    }, []);

    const renderTopicGrid = (category: "krankheiten" | "therapieformen") => (
        <div className="task-pool-grid">
            {contentTopics
                .filter((topic) => topic.category === category)
                .map((topic) => {
                    const assignedCount = (assignments[topic.key] || []).length;

                    return (
                        <KolCard _label="" className="task-card" key={topic.key}>
                            <div className="task-pool-card-header">
                                <div className="task-pool-card-header-text">
                                    <h3>{topic.title}</h3>
                                    <p className="task-pool-card-category">
                                        {assignedCount === 0
                                            ? "Noch niemandem zugewiesen"
                                            : `${assignedCount} ${assignedCount === 1 ? "Patient" : "Patienten"} zugewiesen`}
                                    </p>
                                </div>
                            </div>

                            <div className="task-pool-card-footer">
                                <div />
                                <KolButton
                                    _label="Zuweisen"
                                    _variant="secondary"
                                    className="task-pool-assign-btn"
                                    _on={{ onClick: () => setAssigningTopic(topic) }}
                                />
                            </div>
                        </KolCard>
                    );
                })}
        </div>
    );

    return (
        <div className="task-pool-page">
            <div className="task-pool-header-row">
                <div>
                    <KolHeading _level={1} _label="Lerninhalte" />

                    <p className="task-subtitle">
                        Weise Patienten passende Krankheits- und Therapieform-Inhalte zu
                    </p>
                </div>
            </div>

            <h2 className="assigned-tasks-heading">Krankheiten</h2>
            {renderTopicGrid("krankheiten")}

            <h2 className="assigned-tasks-heading" style={{ marginTop: "28px" }}>
                Therapieformen
            </h2>
            {renderTopicGrid("therapieformen")}

            {assigningTopic && (
                <AssignContentModal
                    topic={assigningTopic}
                    patients={patients}
                    assignedPatientIds={assignments[assigningTopic.key] || []}
                    onClose={() => setAssigningTopic(null)}
                    onSaved={() => {
                        setAssigningTopic(null);
                        loadAssignments();
                    }}
                />
            )}
        </div>
    );
}

function AssignContentModal({
    topic,
    patients,
    assignedPatientIds,
    onClose,
    onSaved,
}: {
    topic: ContentTopic;
    patients: Patient[];
    assignedPatientIds: number[];
    onClose: () => void;
    onSaved: () => void;
}) {
    const [selectedPatients, setSelectedPatients] = useState<number[]>(assignedPatientIds);
    const [saving, setSaving] = useState(false);

    const togglePatient = (patientId: number) => {
        setSelectedPatients((prev) =>
            prev.includes(patientId)
                ? prev.filter((id) => id !== patientId)
                : [...prev, patientId]
        );
    };

    const handleSave = async () => {
        setSaving(true);

        await fetch(
            `http://localhost:8080/api/therapist/content/${topic.key}/assignments`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": localStorage.getItem("userId") || "",
                },
                body: JSON.stringify({ patientIds: selectedPatients }),
            }
        );

        setSaving(false);
        onSaved();
    };

    return (
        <div className="home-mood-overlay">
            <div className="task-modal">
                <KolCard _label="" className="dialog">
                    <KolHeading _level={2} _label={`„${topic.title}" zuweisen`} />

                    <p className="confirm-delete-text">
                        Patienten mit Zugriff wählen. Diese sehen im Reiter „Lerninhalte" einen
                        Hinweis, dass du ihnen dieses Thema empfohlen hast.
                    </p>

                    <div className="task-form-field">
                        <label className="task-form-label">Patienten auswählen</label>

                        <div className="task-assign-patient-list">
                            {patients.length === 0 ? (
                                <p>Keine Patienten vorhanden.</p>
                            ) : (
                                patients.map((patient) => (
                                    <KolButton
                                        key={patient.id}
                                        _label={patient.name}
                                        className="task-assign-patient-btn"
                                        _variant={
                                            selectedPatients.includes(patient.id) ? "primary" : "secondary"
                                        }
                                        _on={{ onClick: () => togglePatient(patient.id) }}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mood-dialog-actions">
                        <KolButton
                            _label="Abbrechen"
                            _variant="secondary"
                            _disabled={saving}
                            _on={{ onClick: onClose }}
                        />

                        <KolButton
                            _label={saving ? "Wird gespeichert …" : "Speichern"}
                            _disabled={saving}
                            _on={{ onClick: handleSave }}
                        />
                    </div>
                </KolCard>
            </div>
        </div>
    );
}
