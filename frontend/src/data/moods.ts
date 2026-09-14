export type Mood = {
    icon: string;
    label: string;
    value: number;
};

// 7-stufige Stimmungsskala mit IcoFont-Icons (https://icofont.com/),
// sortiert von der besten (7) zur schlechtesten (1) Stimmung.
//
// Hinweis: "smiley", "smiley-sad" und "smiley-neutral" existieren nicht als
// echte IcoFont-Klassen (geprüft gegen die offizielle icofont.css). Ersetzt
// durch die nächstliegenden real existierenden Icons aus der IcoFont
// Emoji-Kategorie: "sad", "expressionless", "laughing".
export const moods: Mood[] = [
    { icon: "icofont icofont-nerd-smile", label: "Ausgezeichnet", value: 7 },
    { icon: "icofont icofont-wink-smile", label: "Sehr gut", value: 6 },
    { icon: "icofont icofont-laughing", label: "Gut", value: 5 },
    { icon: "icofont icofont-simple-smile", label: "Ganz gut", value: 4 },
    { icon: "icofont icofont-slightly-smile", label: "Okay", value: 3 },
    { icon: "icofont icofont-expressionless", label: "Nicht gut", value: 2 },
    { icon: "icofont icofont-sad", label: "Sehr schlecht", value: 1 },
];

export function getMoodByValue(value: number | null | undefined): Mood | undefined {
    return moods.find((mood) => mood.value === value);
}
