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