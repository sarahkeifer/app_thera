/**
 * HomeTasksCard
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Zeigt auf der Patienten-Startseite eine kompakte Übersicht der aktuell
 * offenen (zugewiesenen) Aufgaben inkl. Sprungmarke zur vollständigen
 * Aufgabenliste (`TaskView`).
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - Lädt beim Mount alle zugewiesenen Aufgaben des eingeloggten Patienten
 *   vom Backend und filtert clientseitig auf den Status `OPEN`.
 * - Zeigt die ersten drei offenen Aufgaben als Kurzliste; bei keinen
 *   offenen Aufgaben erscheint eine positive Leer-Meldung.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * react-router-dom (useNavigate), @public-ui/react-v19 (KolButton, KolCard,
 * KolHeading), types/task.ts.
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Bewusst keine Pagination/Infinite-Scroll für die Kurzliste – als reines
 * "Teaser"-Widget wird die Liste absichtlich auf drei Einträge begrenzt;
 * für die vollständige, filterbare Liste existiert `TaskView`.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Die Karte übernimmt die responsive Breite von `KolCard`/dem umgebenden
 * Seiten-Container; die Kurzliste ist eine einfache, vertikal fließende
 * `<ul>`, die auf jeder Bildschirmgröße ohne horizontales Scrollen
 * funktioniert.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolCard, KolHeading.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {KolButton, KolCard, KolHeading, KolIcon} from "@public-ui/react-v19";
import type {AssignedTask} from "../types/task.ts";


export default function HomeTasksCard() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<AssignedTask[]>([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/patient/tasks", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setTasks(data));
    }, []);

    const openTasks = tasks.filter((task) => task.status === "OPEN");

    return (
        <KolCard className="home-tasks" _label="">
            <div className="home-mood-header">
                <KolIcon
                    className="home-mood-icon"
                    _icons="icofont icofont-tasks-alt"
                    _label="Aufgaben"
                />
                <KolHeading _level={2} _label="Offene Aufgaben" />
            </div>

            {openTasks.length === 0 ? (
                <p className="home-tasks-empty">Du hast aktuell keine offenen Aufgaben. 🎉</p>
            ) : (
                <>
                    <p className="home-subtitle">
                        {openTasks.length} offene {openTasks.length === 1 ? "Aufgabe" : "Aufgaben"}
                    </p>

                    <ul className="home-tasks-list">
                        {openTasks.slice(0, 3).map((task) => (
                            <li key={task.id}>{task.title}</li>
                        ))}
                    </ul>
                </>
            )}

            <div className="home-tasks-button">
                <KolButton
                    _label="Zu meinen Aufgaben"
                    _variant="secondary"
                    _on={{ onClick: () => navigate("/patient/taskview") }}
                />
            </div>
        </KolCard>
    );
}
