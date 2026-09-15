/**
 * moods (Datenmodul)
 * ============================================================================
 * Zweck: Definiert die fünf auswählbaren Stimmungsstufen (Wert, Label,
 * Icon) inklusive Hilfsfunktion `getMoodByValue`, die von `HomeMoodCard`
 * und `MoodView` zur Anzeige der Stimmungs-Buttons und -Historie genutzt
 * werden. Reine Datendefinition ohne UI-Logik.
 */

export type Mood = {
    icon: string;
    label: string;
    value: number;
};

// 5-stufige Stimmungsskala mit IcoFont-Icons (https://icofont.com/),
// sortiert von der besten (5) zur schlechtesten (1) Stimmung.
//
// Hinweis: "smiley", "smiley-sad" und "smiley-neutral" existieren nicht als
// echte IcoFont-Klassen (geprüft gegen die offizielle icofont.css). Es werden
// ausschließlich real existierende Icons aus der IcoFont-Emoji-Kategorie
// verwendet.
export const moods: Mood[] = [
    { icon: "icofont icofont-nerd-smile", label: "Ausgezeichnet", value: 5 },
    { icon: "icofont icofont-laughing", label: "Gut", value: 4 },
    { icon: "icofont icofont-slightly-smile", label: "Okay", value: 3 },
    { icon: "icofont icofont-expressionless", label: "Nicht gut", value: 2 },
    { icon: "icofont icofont-sad", label: "Sehr schlecht", value: 1 },
];

export function getMoodByValue(value: number | null | undefined): Mood | undefined {
    return moods.find((mood) => mood.value === value);
}
