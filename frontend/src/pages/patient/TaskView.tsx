/**
 * TaskView (Patient)
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Zentrale Aufgaben- und Lerninhalte-Ansicht für Patienten. Kombiniert
 * drei Bereiche: (1) Einstieg in die Lerninhalte-Kategorien
 * (Krankheiten/Therapieformen), (2) zugewiesene Aufgaben (aktiv +
 * archiviert), gefiltert nach Aufgabentyp, sowie (3) Detailansichten für
 * einzelne Aufgaben bzw. Lerninhalte über `DetailDialog`.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - `loadAssignedTasks()`: lädt die dem Patienten zugewiesenen Aufgaben.
 * - `toggleTaskStatus()`: wechselt optimistisch (sofortiges UI-Update) den
 *   Status einer Aufgabe zwischen `OPEN`/`COMPLETED` und persistiert die
 *   Änderung per `PATCH`.
 * - `handleDeleteAssignedTask()`: entfernt eine Aufgabe aus der
 *   persönlichen Liste (per `DELETE`), ohne die zugrunde liegende
 *   Aufgaben-Vorlage zu beeinflussen.
 * - Ableitung von `activeTasks`/`archivedTasks` aus `assignedTasks`:
 *   archiviert sind Aufgaben, die entweder erledigt sind oder deren
 *   Vorlage vom Therapeuten aus dem Aufgaben-Pool entfernt wurde
 *   (`templateDeleted`), sodass diese Historie erhalten bleibt, ohne als
 *   aktiv angezeigt zu werden.
 * - `renderTaskCard()`: gemeinsame Kartendarstellung für aktive und
 *   archivierte Aufgaben, inkl. Badges für "Erledigt"/"Nicht mehr
 *   verfügbar".
 * - `ConfirmDeleteTaskDialog`: separate, lokal gehaltene Komponente für den
 *   Lösch-Bestätigungsdialog inkl. eigenem Lade-/Sperr-Zustand
 *   (`deleting`), damit der "Löschen"-Button während des Requests
 *   deaktiviert ist.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolButton, KolCard, KolHeading), PsychoCard,
 * DetailDialog, TaskDetailContent, data/contentTopics.ts, types/task.ts.
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Die Filter-Leiste ("Alle"/"Psychoedukation"/"Aktivität"/"Reflexion") ist
 * bewusst als Reihe von `KolButton`-Toggles statt als Select/Dropdown
 * umgesetzt, da bei nur vier Optionen eine permanent sichtbare
 * Button-Gruppe schneller bedienbar ist. Detailansichten (Aufgabe,
 * Lerninhalt, Löschen-Bestätigung) teilen sich konsequent die
 * `DetailDialog`-Hülle bzw. das gleiche Overlay-Muster, um ein
 * einheitliches Erscheinungsbild zu gewährleisten.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Die Filter-Leiste (`.task-filter-row`) scrollt horizontal
 * (`overflow-x: auto`) statt umzubrechen, damit sie auf schmalen
 * Bildschirmen kompakt bleibt, ohne Buttons zu verkleinern. Die
 * Karten-Raster (`.lerninhalte-grid`, `.task-card-list`) verwenden
 * `repeat(auto-fill, minmax(...))`, wodurch sich die Spaltenzahl
 * automatisch von mehrspaltig (Desktop) über zweispaltig (Tablet) bis
 * einspaltig (Mobile) anpasst.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolCard, KolHeading (zusätzlich über PsychoCard,
 * DetailDialog, TaskDetailContent).
 */

import { useEffect, useState } from "react";
import PsychoCard from "../../components/PsychoCard";
import DetailDialog from "../../components/DetailDialog";
import TaskDetailContent from "../../components/TaskDetailContent";
import { contentTopics, type ContentTopicKey } from "../../data/contentTopics";
import { KolButton, KolCard, KolHeading } from "@public-ui/react-v19";
import { assignedTypeInfo, formatDueDate, type AssignedTask, type AssignedTaskStatus } from "../../types/task.ts";

type TaskFilter = "all" | "psychoedukation" | "aktivitaet" | "reflexion";

const psychoedukationCards = [
    {
        title: "Therapieformen",
        description: "Lerne verschiedene Therapieformen kennen",
    },
    {
        title: "Krankheiten",
        description: "Informationen zu psychischen Erkrankungen",
    },
];

export default function TaskView() {
    const [filter, setFilter] = useState<TaskFilter>("all");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
    const [assignedContentKeys, setAssignedContentKeys] = useState<ContentTopicKey[]>([]);
    const [openTaskId, setOpenTaskId] = useState<number | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

    const loadAssignedTasks = () => {
        fetch("http://localhost:8080/api/patient/tasks", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setAssignedTasks(data));
    };

    useEffect(() => {
        loadAssignedTasks();

        fetch("http://localhost:8080/api/patient/content/assignments", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setAssignedContentKeys(data));
    }, []);

    const toggleTaskStatus = async (task: AssignedTask) => {
        const nextStatus: AssignedTaskStatus = task.status === "OPEN" ? "COMPLETED" : "OPEN";

        setAssignedTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );

        await fetch(`http://localhost:8080/api/patient/tasks/${task.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": localStorage.getItem("userId") || "",
            },
            body: JSON.stringify({ status: nextStatus }),
        });
    };

    const handleDeleteAssignedTask = async (taskId: number) => {
        await fetch(`http://localhost:8080/api/patient/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        });

        setAssignedTasks((prev) => prev.filter((t) => t.id !== taskId));
    };

    const openTaskCount = assignedTasks.filter(
        (task) => task.status === "OPEN" && !task.templateDeleted
    ).length;

    const visibleAssignedTasks = assignedTasks.filter(
        (task) => filter === "all" || assignedTypeInfo[task.type].filter === filter
    );

    const activeTasks = visibleAssignedTasks.filter(
        (task) => task.status === "OPEN" && !task.templateDeleted
    );

    const archivedTasks = visibleAssignedTasks.filter(
        (task) => task.status === "COMPLETED" || task.templateDeleted
    );

    const openTask = assignedTasks.find((task) => task.id === openTaskId) ?? null;

    const deletingTask = assignedTasks.find((task) => task.id === deletingTaskId) ?? null;

    const selectedTopic = contentTopics.find((topic) => topic.key === selectedCategory);

    function renderTaskCard(task: AssignedTask) {
        const info = assignedTypeInfo[task.type];
        const dueDateLabel = formatDueDate(task.dueDate);
        const isCompleted = task.status === "COMPLETED";
        const isUnavailable = task.templateDeleted;

        return (
            <KolCard
                _label=""
                className={`task-card assigned-task-card${isCompleted ? " completed" : ""}${
                    isUnavailable ? " unavailable" : ""
                }`}
                key={task.id}
            >
                <div className="assigned-task-header">
                    <KolHeading _level={3} _label={task.title} />

                    <div className="assigned-task-header-actions">
                        {isUnavailable ? (
                            <span className="assigned-task-unavailable-badge">Nicht mehr verfügbar</span>
                        ) : (
                            isCompleted && (
                                <span className="assigned-task-status-badge">Erledigt</span>
                            )
                        )}

                        <KolButton
                            _label="✕"
                            _hideLabel={false}
                            _variant="secondary"
                            className="task-pool-delete-btn"
                            _on={{ onClick: () => setDeletingTaskId(task.id) }}
                        />
                    </div>
                </div>

                <p className="task-card-description">{task.description}</p>

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

                {!isUnavailable && (
                    <div className="assigned-task-actions">
                        <KolButton
                            _label="Aufgabenblatt öffnen"
                            _variant="secondary"
                            _on={{ onClick: () => setOpenTaskId(task.id) }}
                        />

                        <KolButton
                            _label={isCompleted ? "Als offen markieren" : "Als erledigt markieren"}
                            _variant={isCompleted ? "secondary" : "primary"}
                            _on={{ onClick: () => toggleTaskStatus(task) }}
                        />
                    </div>
                )}
            </KolCard>
        );
    }

    return (
        <div className="task-page">
            <KolHeading
                _level={1}
                _label="Aufgaben"
            />

            <p className="task-subtitle">
                {openTaskCount} offene {openTaskCount === 1 ? "Aufgabe" : "Aufgaben"}
            </p>

            <div className="task-filter-row">

                <KolButton
                    _label="Alle"
                    className="filter-btn"
                    _variant={filter === "all" ? "primary" : "secondary"}
                    _on={{
                        onClick: () => {
                            setFilter("all");
                            setSelectedCategory("");
                        },
                    }}
                />

                <KolButton
                    _label="Psychoedukation"
                    className="filter-btn"
                    _variant={filter === "psychoedukation" ? "primary" : "secondary"}
                    _on={{
                        onClick: () => {
                            setFilter("psychoedukation");
                            setSelectedCategory("");
                        },
                    }}
                />

                <KolButton
                    _label="Aktivität"
                    className="filter-btn"
                    _variant={filter === "aktivitaet" ? "primary" : "secondary"}
                    _on={{
                        onClick: () => setFilter("aktivitaet"),
                    }}
                />

                <KolButton
                    _label="Reflexion"
                    className="filter-btn"
                    _variant={filter === "reflexion" ? "primary" : "secondary"}
                    _on={{
                        onClick: () => setFilter("reflexion"),
                    }}
                />
            </div>

            {selectedCategory === "" && (
                <>
                    {(filter === "all" || filter === "psychoedukation") && (
                        <div className="assigned-tasks-section">
                            <h2 className="assigned-tasks-heading">Lerninhalte</h2>

                            <div className="lerninhalte-grid">
                                {psychoedukationCards.map((card) => (
                                    <KolCard
                                        _label=""
                                        className="task-card"
                                        key={card.title}
                                        onClick={() => {
                                            if (card.title === "Krankheiten") setSelectedCategory("krankheiten");
                                            if (card.title === "Therapieformen") setSelectedCategory("therapieformen");
                                        }}
                                    >
                                        <KolHeading _level={2} _label={card.title} />
                                        <p className="task-card-description">{card.description}</p>
                                    </KolCard>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="assigned-tasks-section">
                        <h2 className="assigned-tasks-heading">Aufgaben</h2>

                        {activeTasks.length === 0 ? (
                            <p className="task-pool-empty">Keine offenen Aufgaben für diesen Filter.</p>
                        ) : (
                            <div className="lerninhalte-grid">
                                {activeTasks.map(renderTaskCard)}
                            </div>
                        )}
                    </div>

                    <div className="assigned-tasks-section">
                        <h2 className="assigned-tasks-heading">Archivierte Aufgaben</h2>

                        <p className="task-subtitle">
                            Erledigte Aufgaben und Aufgaben, die dein Therapeut aus dem Aufgaben-Pool entfernt hat.
                        </p>

                        {archivedTasks.length === 0 ? (
                            <p className="task-pool-empty">Noch keine archivierten oder erledigten Aufgaben.</p>
                        ) : (
                            <div className="lerninhalte-grid">
                                {archivedTasks.map(renderTaskCard)}
                            </div>
                        )}
                    </div>
                </>
            )}

            {(filter === "all" || filter === "psychoedukation") && selectedCategory === "krankheiten" && (
                <div className="assigned-tasks-section">
                    <KolButton
                        _label="← Zurück"
                        _variant="secondary"
                        className="lerninhalte-back-btn"
                        _on={{ onClick: () => setSelectedCategory("") }}
                    />

                    <div className="task-card-list">
                        {contentTopics
                            .filter((topic) => topic.category === "krankheiten")
                            .map((topic) => (
                                <KolCard
                                    _label=""
                                    className="task-card"
                                    key={topic.key}
                                    onClick={() => setSelectedCategory(topic.key)}
                                >
                                    <div className="content-topic-card-header">
                                        <span>{topic.title}</span>
                                        {assignedContentKeys.includes(topic.key) && (
                                            <span className="content-topic-recommended-badge">
                                                Von deinem Therapeuten empfohlen
                                            </span>
                                        )}
                                    </div>
                                </KolCard>
                            ))}
                    </div>
                </div>
            )}

            {(filter === "all" || filter === "psychoedukation") && selectedCategory === "therapieformen" && (
                <div className="assigned-tasks-section">
                    <KolButton
                        _label="← Zurück"
                        _variant="secondary"
                        className="lerninhalte-back-btn"
                        _on={{ onClick: () => setSelectedCategory("") }}
                    />

                    <div className="task-card-list">
                        {contentTopics
                            .filter((topic) => topic.category === "therapieformen")
                            .map((topic) => (
                                <KolCard
                                    _label=""
                                    className="task-card"
                                    key={topic.key}
                                    onClick={() => setSelectedCategory(topic.key)}
                                >
                                    <div className="content-topic-card-header">
                                        <span>{topic.title}</span>
                                        {assignedContentKeys.includes(topic.key) && (
                                            <span className="content-topic-recommended-badge">
                                                Von deinem Therapeuten empfohlen
                                            </span>
                                        )}
                                    </div>
                                </KolCard>
                            ))}
                    </div>
                </div>
            )}

            {openTask && (
                <DetailDialog onClose={() => setOpenTaskId(null)}>
                    <TaskDetailContent
                        task={openTask}
                        onToggleStatus={() => toggleTaskStatus(openTask)}
                    />
                </DetailDialog>
            )}

            {selectedTopic && (
                <DetailDialog
                    onClose={() => setSelectedCategory(selectedTopic.category)}
                >
                    <PsychoCard
                        title={selectedTopic.content.title}
                        boxes={selectedTopic.content.boxes}
                        source={selectedTopic.source}
                    />
                </DetailDialog>
            )}

            {deletingTask && (
                <ConfirmDeleteTaskDialog
                    task={deletingTask}
                    onCancel={() => setDeletingTaskId(null)}
                    onConfirm={async () => {
                        await handleDeleteAssignedTask(deletingTask.id);
                        setDeletingTaskId(null);
                    }}
                />
            )}
        </div>
    );
}

function ConfirmDeleteTaskDialog({
    task,
    onCancel,
    onConfirm,
}: {
    task: AssignedTask;
    onCancel: () => void;
    onConfirm: () => void | Promise<void>;
}) {
    const [deleting, setDeleting] = useState(false);

    const handleConfirm = async () => {
        setDeleting(true);
        await onConfirm();
        setDeleting(false);
    };

    return (
        <div className="home-mood-overlay">
            <div className="confirm-delete-dialog">
                <KolCard _label="" className="dialog">
                    <KolHeading _level={2} _label="Aufgabe löschen" />

                    <p className="confirm-delete-text">
                        Möchtest du „{task.title}" wirklich aus deiner Liste entfernen? Dieser
                        Vorgang kann nicht rückgängig gemacht werden.
                    </p>

                    <div className="mood-dialog-actions">
                        <KolButton
                            _label="Abbrechen"
                            _variant="secondary"
                            _disabled={deleting}
                            _on={{ onClick: onCancel }}
                        />

                        <KolButton
                            _label={deleting ? "Wird gelöscht …" : "Löschen"}
                            _disabled={deleting}
                            className="confirm-delete-btn"
                            _on={{ onClick: handleConfirm }}
                        />
                    </div>
                </KolCard>
            </div>
        </div>
    );
}
