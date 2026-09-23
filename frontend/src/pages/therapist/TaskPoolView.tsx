/**
 * TaskPoolView (Therapeut)
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Verwaltung des Aufgaben-Pools: Anlegen neuer Aufgaben-Vorlagen, Filtern
 * nach Typ (Psychoedukation/Aktivität/Reflexion) und Suchbegriff, Zuweisen
 * einer Vorlage an einen oder mehrere Patienten sowie Löschen von Vorlagen
 * (mit Bestätigungsdialog).
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - Lädt beim Mount Aufgaben-Vorlagen und Patientenliste parallel.
 * - `searchTerm`/`selectedType` filtern clientseitig die angezeigten
 *   Vorlagen.
 * - `NewTaskModal`: eigenständiges Formular zum Anlegen einer neuen
 *   Vorlage inkl. Validierung der Pflichtfelder vor dem Speichern.
 * - `AssignTaskModal`: Mehrfachauswahl von Patienten inkl. optionalem
 *   Fälligkeitsdatum; zeigt nach erfolgreicher Zuweisung eine
 *   Erfolgsmeldung (`assigned`), bevor der Dialog geschlossen wird.
 * - `ConfirmDeleteDialog`: eigener Bestätigungsdialog mit Lade-/
 *   Fehlerzustand für den Löschvorgang einer Vorlage.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolButton, KolCard, KolHeading, KolInputDate,
 * KolInputText, KolTextarea).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Die drei Dialoge (Neue Aufgabe, Zuweisen, Löschen-Bestätigung) sind als
 * separate, lokal in dieser Datei definierte Komponenten organisiert statt
 * ausgelagert, da sie eng an den State/die Handler von `TaskPoolView`
 * gekoppelt sind und außerhalb dieser Seite nicht wiederverwendet werden.
 * Alle Formularfelder nutzen konsequent KoliBri-Eingabekomponenten
 * (`KolInputText`, `KolInputDate`, `KolTextarea`); die Typ-Filter-Leiste
 * ist – analog zu `TaskView` beim Patienten – als `KolButton`-Gruppe
 * statt als Dropdown umgesetzt, um die kleine, feste Optionsanzahl direkt
 * bedienbar zu machen.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Das Karten-Raster (`.task-pool-grid`) nutzt
 * `repeat(auto-fill, minmax(280px, 1fr))` und passt die Spaltenanzahl
 * dadurch automatisch an die verfügbare Breite an (mehrspaltig auf
 * Desktop, ein- bis zweispaltig auf Tablet/Mobile). Die Kopfzeile
 * (`.task-pool-header-row`) verwendet `flex-wrap`, damit Überschrift und
 * "Neue Aufgabe"-Button auf schmalen Bildschirmen untereinander statt
 * nebeneinander abgeschnitten dargestellt werden.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolCard, KolHeading, KolInputDate, KolInputText, KolTextarea.
 */

import { useEffect, useState } from "react";
import {
    KolButton,
    KolCard,
    KolHeading,
    KolIcon,
    KolInputDate,
    KolInputFile,
    KolInputText,
    KolTextarea,
} from "@public-ui/react-v19";
import { openTaskFileFromUrl } from "../../types/task.ts";

type TaskType = "PSYCHOEDUCATION" | "ACTIVITY" | "REFLECTION";

type TaskTemplate = {
    id: number;
    title: string;
    description: string;
    type: TaskType;
    duration: string;
    category: string;
    materials: string;
    fileName: string | null;
};

type Patient = {
    id: number;
    name: string;
};

const typeInfo: Record<TaskType, { label: string; className: string }> = {
    PSYCHOEDUCATION: { label: "Lernen", className: "task-type-learn" },
    ACTIVITY: { label: "Aktivität", className: "task-type-activity" },
    REFLECTION: { label: "Reflexion", className: "task-type-reflection" },
};

function openTaskFile(taskId: number) {
    openTaskFileFromUrl(`http://localhost:8080/api/therapist/tasks/${taskId}/file`);
}

export default function TaskPoolView() {
    const [tasks, setTasks] = useState<TaskTemplate[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<TaskType | "all">("all");
    const [showNewTask, setShowNewTask] = useState(false);
    const [assigningTask, setAssigningTask] = useState<TaskTemplate | null>(null);
    const [deletingTask, setDeletingTask] = useState<TaskTemplate | null>(null);

    const loadTasks = () => {
        fetch("http://localhost:8080/api/therapist/tasks", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setTasks(data));
    };

    useEffect(() => {
        loadTasks();

        fetch("http://localhost:8080/api/therapist/patients", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setPatients(data));
    }, []);

    const handleDeleteTask = async (taskId: number): Promise<{ success: boolean; error?: string }> => {
        const res = await fetch(`http://localhost:8080/api/therapist/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        });

        if (res.ok) {
            loadTasks();
            return { success: true };
        }

        return { success: false, error: "Löschen fehlgeschlagen. Bitte versuchen Sie es erneut." };
    };

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "all" || task.type === selectedType;

        return matchesSearch && matchesType;
    });

    return (
        <div className="task-pool-page">
            <div className="task-pool-header-row">
                <div>
                    <KolHeading _level={1} _label="Aufgaben-Pool" />

                    <p className="task-subtitle">
                        {tasks.length} verfügbare Aufgaben-Vorlagen
                    </p>
                </div>

                <KolButton
                    _label="+ Neue Aufgabe erstellen"
                    _on={{ onClick: () => setShowNewTask(true) }}
                />
            </div>

            <div className="task-pool-search-row">
                <KolInputText
                    _label="Aufgabe suchen"
                    _hideLabel
                    _placeholder="Aufgabe suchen..."
                    _value={searchTerm}
                    _on={{ onInput: (_e, value) => setSearchTerm(String(value)) }}
                />
            </div>

            <div className="task-filter-row">
                <KolButton
                    _label="Alle"
                    className="filter-btn"
                    _variant={selectedType === "all" ? "primary" : "secondary"}
                    _on={{ onClick: () => setSelectedType("all") }}
                />
                <KolButton
                    _label="Lernen"
                    className="filter-btn"
                    _variant={selectedType === "PSYCHOEDUCATION" ? "primary" : "secondary"}
                    _on={{ onClick: () => setSelectedType("PSYCHOEDUCATION") }}
                />
                <KolButton
                    _label="Aktivität"
                    className="filter-btn"
                    _variant={selectedType === "ACTIVITY" ? "primary" : "secondary"}
                    _on={{ onClick: () => setSelectedType("ACTIVITY") }}
                />
                <KolButton
                    _label="Reflexion"
                    className="filter-btn"
                    _variant={selectedType === "REFLECTION" ? "primary" : "secondary"}
                    _on={{ onClick: () => setSelectedType("REFLECTION") }}
                />
            </div>

            {filteredTasks.length === 0 ? (
                <p className="task-pool-empty">Keine Aufgaben gefunden.</p>
            ) : (
                <div className="task-pool-grid">
                    {filteredTasks.map((task) => {
                        const info = typeInfo[task.type];

                        return (
                            <KolCard _label="" className="task-card" key={task.id}>
                                <div className="task-pool-card-header">
                                    <div className="task-pool-card-header-text">
                                        <h3>{task.title}</h3>
                                        <p className="task-pool-card-category">{task.category}</p>
                                    </div>

                                    <KolButton
                                        _label="Aufgabe löschen"
                                        _hideLabel
                                        _icons="icofont icofont-ui-delete"
                                        _variant="secondary"
                                        className="task-pool-delete-btn"
                                        _on={{ onClick: () => setDeletingTask(task) }}
                                    />
                                </div>

                                <p className="task-pool-card-description">{task.description}</p>

                                {task.materials && (
                                    <p className="task-pool-card-materials">
                                        Materialien: {task.materials}
                                    </p>
                                )}

                                {task.fileName && (
                                    <button
                                        type="button"
                                        className="task-file-pill"
                                        onClick={() => openTaskFile(task.id)}
                                    >
                                        <KolIcon _icons="icofont icofont-file-pdf" _label="" />
                                        <span>{task.fileName}</span>
                                    </button>
                                )}

                                <div className="task-pool-card-footer">
                                    <div className={`task-pool-card-meta ${info.className}`}>
                                        <span>{info.label}</span>
                                        <span>•</span>
                                        <span>{task.duration}</span>
                                    </div>

                                    <KolButton
                                        _label="Zuweisen"
                                        _variant="secondary"
                                        className="task-pool-assign-btn"
                                        _on={{ onClick: () => setAssigningTask(task) }}
                                    />
                                </div>
                            </KolCard>
                        );
                    })}
                </div>
            )}

            {showNewTask && (
                <NewTaskModal
                    onClose={() => setShowNewTask(false)}
                    onCreated={() => {
                        setShowNewTask(false);
                        loadTasks();
                    }}
                />
            )}

            {assigningTask && (
                <AssignTaskModal
                    task={assigningTask}
                    patients={patients}
                    onClose={() => setAssigningTask(null)}
                />
            )}

            {deletingTask && (
                <ConfirmDeleteDialog
                    task={deletingTask}
                    onCancel={() => setDeletingTask(null)}
                    onConfirm={async () => {
                        const result = await handleDeleteTask(deletingTask.id);
                        if (result.success) {
                            setDeletingTask(null);
                        }
                        return result;
                    }}
                />
            )}
        </div>
    );
}

function ConfirmDeleteDialog({
    task,
    onCancel,
    onConfirm,
}: {
    task: TaskTemplate;
    onCancel: () => void;
    onConfirm: () => Promise<{ success: boolean; error?: string }>;
}) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const handleConfirm = async () => {
        setDeleting(true);
        setError("");

        const result = await onConfirm();

        setDeleting(false);

        if (!result.success) {
            setError(result.error || "Löschen fehlgeschlagen.");
        }
    };

    return (
        <div className="home-mood-overlay">
            <div className="confirm-delete-dialog">
                <KolCard _label="" className="dialog">
                    <KolHeading _level={2} _label="Aufgabe löschen" />

                    <p className="confirm-delete-text">
                        Möchten Sie die Aufgabe „{task.title}" wirklich löschen? Sie
                        verschwindet aus Ihrem Aufgaben-Pool und kann nicht mehr neu
                        zugewiesen werden. Bereits zugewiesene Aufgaben bleiben für die
                        jeweiligen Patienten bis zur Abgabe bestehen.
                    </p>

                    <div className="task-modal-error">{error}</div>

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

function NewTaskModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<TaskType>("REFLECTION");
    const [duration, setDuration] = useState("");
    const [category, setCategory] = useState("");
    const [materials, setMaterials] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState("");
    const [error, setError] = useState("");

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    const handleFileInput = (value: unknown) => {
        const files = value as FileList | null | undefined;
        const file = files && files.length > 0 ? files[0] : null;

        if (!file) {
            setSelectedFile(null);
            setFileError("");
            return;
        }

        if (file.type !== "application/pdf") {
            setFileError("Bitte nur PDF-Dateien hochladen.");
            setSelectedFile(null);
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setFileError("Die Datei darf maximal 10 MB groß sein.");
            setSelectedFile(null);
            return;
        }

        setFileError("");
        setSelectedFile(file);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const [uploading, setUploading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) {
            setError("Bitte einen Titel angeben");
            return;
        }

        setError("");
        setUploading(true);

        const createResponse = await fetch("http://localhost:8080/api/therapist/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": localStorage.getItem("userId") || "",
            },
            body: JSON.stringify({ title, description, type, duration, category, materials }),
        });

        const createdTask = await createResponse.json();

        // Zweiter Schritt: Die PDF wird erst NACH dem Anlegen der Aufgabe
        // hochgeladen, da der Datei-Endpunkt die Task-ID des bereits
        // angelegten Templates braucht (multipart/form-data getrennt vom
        // JSON-Body der Aufgabe selbst - siehe TaskController#uploadFile).
        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const uploadResponse = await fetch(
                `http://localhost:8080/api/therapist/tasks/${createdTask.id}/file`,
                {
                    method: "POST",
                    headers: {
                        "X-User-Id": localStorage.getItem("userId") || "",
                    },
                    body: formData,
                }
            );

            if (!uploadResponse.ok) {
                setUploading(false);
                setError(
                    "Die Aufgabe wurde erstellt, aber die Datei konnte nicht hochgeladen werden."
                );
                return;
            }
        }

        setUploading(false);
        onCreated();
    };

    return (
        <div className="home-mood-overlay">
            <div className="task-modal">
                <KolCard _label="" className="dialog">
                    <KolHeading _level={2} _label="Neue Aufgabe erstellen" />

                    <div className="task-form-field">
                        <label className="task-form-label">Titel</label>
                        <KolInputText
                            _label="Titel"
                            _hideLabel
                            _placeholder="z.B. Dankbarkeitsjournal"
                            _value={title}
                            _on={{ onInput: (_e, value) => setTitle(String(value)) }}
                        />
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-label">Beschreibung</label>
                        <KolTextarea
                            _label="Beschreibung"
                            _hideLabel
                            _placeholder="Detaillierte Anleitung für den Patienten..."
                            _value={description}
                            _on={{ onInput: (_e, value) => setDescription(String(value)) }}
                        />
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-label">Typ</label>
                        <div className="task-form-type-row">
                            <KolButton
                                _label="Reflexion"
                                className="filter-btn"
                                _variant={type === "REFLECTION" ? "primary" : "secondary"}
                                _on={{ onClick: () => setType("REFLECTION") }}
                            />
                            <KolButton
                                _label="Aktivität"
                                className="filter-btn"
                                _variant={type === "ACTIVITY" ? "primary" : "secondary"}
                                _on={{ onClick: () => setType("ACTIVITY") }}
                            />
                            <KolButton
                                _label="Lernen"
                                className="filter-btn"
                                _variant={type === "PSYCHOEDUCATION" ? "primary" : "secondary"}
                                _on={{ onClick: () => setType("PSYCHOEDUCATION") }}
                            />
                        </div>
                    </div>

                    <div className="task-form-grid">
                        <div className="task-form-field">
                            <label className="task-form-label">Dauer</label>
                            <KolInputText
                                _label="Dauer"
                                _hideLabel
                                _placeholder="z.B. 15 Min"
                                _value={duration}
                                _on={{ onInput: (_e, value) => setDuration(String(value)) }}
                            />
                        </div>

                        <div className="task-form-field">
                            <label className="task-form-label">Kategorie</label>
                            <KolInputText
                                _label="Kategorie"
                                _hideLabel
                                _placeholder="z.B. Achtsamkeit"
                                _value={category}
                                _on={{ onInput: (_e, value) => setCategory(String(value)) }}
                            />
                        </div>
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-label">Materialien (optional)</label>
                        <KolInputText
                            _label="Materialien"
                            _hideLabel
                            _placeholder="z.B. Stift, Papier, Arbeitsblatt aus der Sitzung"
                            _value={materials}
                            _on={{ onInput: (_e, value) => setMaterials(String(value)) }}
                        />
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-label">PDF-Anhang (optional)</label>

                        {selectedFile ? (
                            <div className="task-file-chip">
                                <KolIcon _icons="icofont icofont-file-pdf" _label="" />

                                <div className="task-file-chip-info">
                                    <span className="task-file-chip-name">{selectedFile.name}</span>
                                    <span className="task-file-chip-size">
                                        {formatFileSize(selectedFile.size)}
                                    </span>
                                </div>

                                <KolButton
                                    _label="Datei entfernen"
                                    _hideLabel
                                    _icons="icofont icofont-ui-delete"
                                    _variant="secondary"
                                    className="task-file-chip-remove"
                                    _on={{ onClick: () => setSelectedFile(null) }}
                                />
                            </div>
                        ) : (
                            <KolInputFile
                                _label="PDF-Anhang"
                                _hideLabel
                                _accept="application/pdf"
                                _hint="Max. 10 MB, nur PDF-Dateien."
                                _on={{ onInput: (_e, value) => handleFileInput(value) }}
                            />
                        )}

                        {fileError && <p className="task-modal-error">{fileError}</p>}
                    </div>

                    <div className="task-modal-error">{error}</div>

                    <div className="mood-dialog-actions">
                        <KolButton
                            _label="Abbrechen"
                            _variant="secondary"
                            _disabled={uploading}
                            _on={{ onClick: onClose }}
                        />
                        <KolButton
                            _label={uploading ? "Wird erstellt …" : "Erstellen"}
                            _disabled={uploading}
                            _on={{ onClick: handleCreate }}
                        />
                    </div>
                </KolCard>
            </div>
        </div>
    );
}

function AssignTaskModal({
    task,
    patients,
    onClose,
}: {
    task: TaskTemplate;
    patients: Patient[];
    onClose: () => void;
}) {
    const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
    const [dueDate, setDueDate] = useState("");
    const [assigned, setAssigned] = useState(false);

    const togglePatient = (patientId: number) => {
        setSelectedPatients((prev) =>
            prev.includes(patientId)
                ? prev.filter((id) => id !== patientId)
                : [...prev, patientId]
        );
    };

    const handleAssign = async () => {
        await fetch(`http://localhost:8080/api/therapist/tasks/${task.id}/assign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": localStorage.getItem("userId") || "",
            },
            body: JSON.stringify({ patientIds: selectedPatients, dueDate: dueDate || null }),
        });

        setAssigned(true);
    };

    const info = typeInfo[task.type];

    return (
        <div className="home-mood-overlay">
            <div className="task-modal">
                <KolCard _label="" className="dialog">
                    <KolHeading _level={2} _label="Aufgabe zuweisen" />

                    <div className="task-assign-preview">
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>

                        {task.materials && (
                            <p className="task-pool-card-materials">
                                Materialien: {task.materials}
                            </p>
                        )}

                        {task.fileName && (
                            <button
                                type="button"
                                className="task-file-pill"
                                onClick={() => openTaskFile(task.id)}
                            >
                                <KolIcon _icons="icofont icofont-file-pdf" _label="" />
                                <span>{task.fileName}</span>
                            </button>
                        )}

                        <div className={`task-pool-card-meta ${info.className}`}>
                            <span>{info.label}</span>
                            <span>•</span>
                            <span>{task.duration}</span>
                            <span>•</span>
                            <span>{task.category}</span>
                        </div>
                    </div>

                    {assigned ? (
                        <p className="task-assign-success">
                            Aufgabe wurde {selectedPatients.length} Patient(en) zugewiesen.
                        </p>
                    ) : (
                        <>
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
                                                    selectedPatients.includes(patient.id)
                                                        ? "primary"
                                                        : "secondary"
                                                }
                                                _on={{ onClick: () => togglePatient(patient.id) }}
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
                                    _variant={dueDate}
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
                                _label={`Zuweisen (${selectedPatients.length})`}
                                _disabled={selectedPatients.length === 0}
                                _on={{ onClick: handleAssign }}
                            />
                        )}
                    </div>
                </KolCard>
            </div>
        </div>
    );
}
