/**
 * TaskDetailContent
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Inhalts-Komponente für die Detailansicht einer zugewiesenen Aufgabe
 * (wird typischerweise innerhalb von `DetailDialog` gerendert). Zeigt
 * Titel, Meta-Informationen (Typ, Dauer, Fälligkeit), Beschreibung,
 * optionale Materialangaben, einen optionalen PDF-Anhang sowie einen
 * Aktions-Button zum Umschalten des Erledigt-Status.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * Rein präsentational; leitet den Status-Wechsel per `onToggleStatus`
 * an die aufrufende Seite (`TaskView`) weiter, die den eigentlichen
 * Backend-Request ausführt. Einzige Ausnahme: Das Öffnen des PDF-Anhangs
 * lädt die Datei direkt selbst (`openTaskFileFromUrl`), da dafür kein
 * State in der übergeordneten Seite benötigt wird.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolButton, KolHeading, KolIcon), types/task.ts
 * (assignedTypeInfo, formatDueDate, openTaskFileFromUrl).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Bewusst zustandslos gehalten: Die Komponente kennt nur den aktuell
 * übergebenen `task` und delegiert jede Änderung nach außen – dadurch bleibt
 * sie unabhängig vom Ladezustand der übergeordneten Liste wiederverwendbar.
 * Der Datei-Anhang wird bewusst als eigener Button statt als <a href> aus
 * der Detailansicht heraus geöffnet, weil der Download-Endpunkt
 * (`/api/patient/tasks/{id}/file`) den X-User-Id-Header zur
 * Berechtigungsprüfung braucht - ein normaler Link könnte diesen Header
 * nicht mitschicken.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Die Meta-Zeile (`.assigned-task-meta`) ist als umbrechende Flex-Zeile
 * umgesetzt, damit lange Kombinationen aus Typ/Dauer/Fälligkeitsdatum auf
 * schmalen Bildschirmen nicht abgeschnitten werden, sondern in eine neue
 * Zeile umbrechen. Der Datei-Anhang-Button (`.task-file-pill`) nutzt
 * dieselbe Klasse wie in TaskPoolView, damit Datei-Chips app-weit gleich
 * aussehen und sich gleich verhalten.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolHeading, KolIcon.
 */

import { KolButton, KolHeading, KolIcon } from "@public-ui/react-v19";
import {type AssignedTask, assignedTypeInfo, formatDueDate, openTaskFileFromUrl} from "../types/task.ts";

type TaskDetailContentProps = {
    task: AssignedTask;
    onToggleStatus: () => void;
};

export default function TaskDetailContent({ task, onToggleStatus }: TaskDetailContentProps) {
    const isCompleted = task.status === "COMPLETED";
    const info = assignedTypeInfo[task.type];
    const dueDateLabel = formatDueDate(task.dueDate);

    return (
        <div className="task-detail">
            <KolHeading _level={2} _label={task.title} />

            <div className="assigned-task-meta">
                <span>{info.label}</span>
                <span>•</span>
                <span>{task.duration}</span>
                {dueDateLabel && (
                    <>
                        <span>•</span>
                        <span>Fällig bis {dueDateLabel}</span>
                    </>
                )}
            </div>

            <div className="task-detail-section">
                <h3>Aufgabenbeschreibung</h3>
                <p>{task.description}</p>
            </div>

            {task.materials && (
                <div className="task-detail-section">
                    <h3>Materialien</h3>
                    <p>{task.materials}</p>
                </div>
            )}

            {task.fileName && (
                <div className="task-detail-section">
                    <h3>Angehängte Datei</h3>
                    <button
                        type="button"
                        className="task-file-pill"
                        onClick={() =>
                            openTaskFileFromUrl(
                                `http://localhost:8080/api/patient/tasks/${task.id}/file`
                            )
                        }
                    >
                        <KolIcon _icons="icofont icofont-file-pdf" _label="" />
                        <span>{task.fileName}</span>
                    </button>
                </div>
            )}

            <div className="task-detail-actions">
                <KolButton
                    _label={isCompleted ? "Als offen markieren" : "Als erledigt markieren"}
                    _variant={isCompleted ? "secondary" : "primary"}
                    _on={{ onClick: onToggleStatus }}
                />
            </div>
        </div>
    );
}
