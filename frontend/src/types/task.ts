/**
 * task (Typdefinitionen & Hilfsfunktionen)
 * ============================================================================
 * Zweck: Zentrale TypeScript-Typen für zugewiesene Aufgaben
 * (`AssignedTask`, `AssignedTaskType`, `AssignedTaskStatus`) sowie
 * Hilfsmittel zur Anzeige (`assignedTypeInfo`-Lookup für Label/Filter-
 * Zuordnung, `formatDueDate` für die lokalisierte Datumsformatierung).
 * Wird u. a. von `TaskView`, `HomeTasksCard` und `TaskDetailContent`
 * importiert, um Redundanzen bei Typ-Labels und Datumsformatierung zu
 * vermeiden.
 */

export type AssignedTaskType = "PSYCHOEDUCATION" | "ACTIVITY" | "REFLECTION";
export type AssignedTaskStatus = "OPEN" | "COMPLETED";

export type AssignedTask = {
    id: number;
    title: string;
    description: string;
    type: AssignedTaskType;
    duration: string;
    category: string;
    materials: string;
    fileName: string | null;
    dueDate: string | null;
    status: AssignedTaskStatus;
    templateDeleted: boolean;
};

export const assignedTypeInfo: Record<AssignedTaskType, { label: string; filter: "psychoedukation" | "aktivitaet" | "reflexion" }> = {
    PSYCHOEDUCATION: { label: "Psychoedukation", filter: "psychoedukation" },
    ACTIVITY: { label: "Aktivität", filter: "aktivitaet" },
    REFLECTION: { label: "Reflexion", filter: "reflexion" },
};

export function formatDueDate(dueDate: string | null) {
    if (!dueDate) return null;

    return new Date(dueDate).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

// Öffnet einen PDF-Anhang (Aufgaben-Vorlage) in einem neuen Tab. Ein
// normaler <a href="..."> funktioniert hier nicht, da die Download-
// Endpunkte (Therapeut: /api/therapist/tasks/{id}/file, Patient:
// /api/patient/tasks/{id}/file) den X-User-Id-Header zur
// Berechtigungsprüfung brauchen - stattdessen wird die Datei per fetch
// geladen, als Blob-URL bereitgestellt und dann geöffnet. Von beiden
// Rollen genutzt (TaskPoolView, TaskDetailContent), daher hier zentral.
export async function openTaskFileFromUrl(url: string) {
    const response = await fetch(url, {
        headers: {
            "X-User-Id": localStorage.getItem("userId") || "",
        },
    });

    if (!response.ok) return;

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    window.open(objectUrl, "_blank");
}