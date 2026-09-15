/**
 * TaskDetailContent
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Inhalts-Komponente für die Detailansicht einer zugewiesenen Aufgabe
 * (wird typischerweise innerhalb von `DetailDialog` gerendert). Zeigt
 * Titel, Meta-Informationen (Typ, Dauer, Fälligkeit), Beschreibung,
 * optionale Materialangaben sowie einen Aktions-Button zum Umschalten
 * des Erledigt-Status.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * Rein präsentational; leitet den Status-Wechsel per `onToggleStatus`
 * an die aufrufende Seite (`TaskView`) weiter, die den eigentlichen
 * Backend-Request ausführt.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolButton, KolHeading), types/task.ts
 * (assignedTypeInfo, formatDueDate).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Bewusst zustandslos gehalten: Die Komponente kennt nur den aktuell
 * übergebenen `task` und delegiert jede Änderung nach außen – dadurch bleibt
 * sie unabhängig vom Ladezustand der übergeordneten Liste wiederverwendbar.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Die Meta-Zeile (`.assigned-task-meta`) ist als umbrechende Flex-Zeile
 * umgesetzt, damit lange Kombinationen aus Typ/Dauer/Fälligkeitsdatum auf
 * schmalen Bildschirmen nicht abgeschnitten werden, sondern in eine neue
 * Zeile umbrechen.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolHeading.
 */

import { KolButton, KolHeading } from "@public-ui/react-v19";
import {type AssignedTask, assignedTypeInfo, formatDueDate} from "../types/task.ts";

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
