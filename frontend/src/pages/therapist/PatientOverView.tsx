import {useEffect, useState} from "react";
import {KolButton, KolCard, KolHeading} from "@public-ui/react-v19";

type PatientOverviewItem = {
    id: string;
    name: string;
    lastMood: number | null;
    lastMoodCreatedAt: string | null;
    activeTasks: number;
    completedTasks: number;
    nextSession: string | null;
};

const moods = [
    {emoji: "🤩", label: "Sehr gut", value: 5},
    {emoji: "😊", label: "Gut", value: 4},
    {emoji: "😐", label: "Okay", value: 3},
    {emoji: "😔", label: "Nicht gut", value: 2},
    {emoji: "😢", label: "Schlecht", value: 1},
];

function getMoodEmoji(value: number | null) {
    return moods.find((mood) => mood.value === value)?.emoji ?? null;
}

function getMoodLabel(value: number | null) {
    return moods.find((mood) => mood.value === value)?.label ?? "Keine Stimmung";
}

export default function PatientOverView() {
    const [patients, setPatients] = useState<PatientOverviewItem[]>([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/therapist/patients", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setPatients(data));
    }, []);

    return (
        <div className="patient-overview">
            <KolHeading
                _level={1}
                _label="Patienten-Übersicht"
            ></KolHeading>

            <KolCard _label="" className="history">
                <table className="patient-table">
                    <thead>
                    <tr>
                        <th>Patient</th>
                        <th>Stimmung</th>
                        <th>Aufgaben</th>
                        <th>Nächster Termin</th>
                        <th>Aktionen</th>
                    </tr>
                    </thead>

                    <tbody>
                    {patients.map((patient) => (
                        <tr key={patient.id}>
                            <td>{patient.name}</td>

                            <td>
                                <div className="patient-mood">
                                    <span className="patient-mood-emoji">
                                        {getMoodEmoji(patient.lastMood)}
                                    </span>

                                    {patient.lastMood ? (
                                        <span>{getMoodLabel(patient.lastMood)}</span>
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
                                {patient.nextSession ?? "Kein Termin"}
                            </td>

                            <td>
                                <div className="patient-assign-button">
                                    <KolButton
                                        _label="Aufgabe zuweisen"
                                        _variant="secondary"
                                    ></KolButton>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </KolCard>
        </div>
    );
}