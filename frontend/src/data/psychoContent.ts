/**
 * psychoContent (Datenmodul)
 * ============================================================================
 * Zweck: Enthält die eigentlichen Lerninhalte (Texte, Aufzählungspunkte,
 * Quellenangaben) zu den in `contentTopics.ts` referenzierten Themen.
 * Reine Datendefinition ohne UI-Logik.
 */

export const depressionContent = {
    title: "Depression",
    boxes: [
        {
            title: "Definition",
            text: "Depression gehört zu den affektiven Störungen. Dabei verändern sich Stimmung, Gefühle und Aktivität deutlich."
        },
        {
            title: "Häufige Symptome",
            points: [
                "Traurige Stimmung",
                "Wenig Energie",
                "Schlafprobleme",
                "Konzentrationsprobleme",
                "Geringes Selbstwertgefühl",
            ],
        },
        {
            title: "Formen",
            points: [
                "Leichte Depression",
                "Mittelgradige Depression",
                "Schwere Depression",
                "Wiederkehrende Depression",
            ],
        },
        {
            title: "Ursachen",
            points: [
                "Stress",
                "Belastungen",
                "Biologische Faktoren",
                "Traumatische Erfahrungen",
            ],
        },
    ],
};

export const angstContent = {
    title: "Angststörung",
    boxes: [
        {
            title: "Definition",
            text: "Angststörungen gehören zu den häufigsten psychischen Erkrankungen. Dabei erleben Betroffene starke Angst oder Sorgen, die den Alltag belasten und oft schwer kontrollierbar sind."
        },{
            title: "Häufige Symptome",
            points: [
                "Ständiges Grübeln",
                "Herzrasen",
                "Starke Angst oder Panik",
                "Schwindel oder Atemnot",
                "Innere Unruhe",

            ],
        },
        {
            title: "Formen",
            points: [
                "Generalisierte Angststörung",
                "Panikstörung",
                "Soziale Angststörung",
                "Spezifische Phobien z.B. Spinnen oder Fliegen",
            ],
        },
        {
            title: "Ursachen",
            points: [
                "Stress und belastende Erfahrungen",
                "Genetische Veranlagung",
                "Traumatische Erlebnisse",
                "Dauerhafte Überforderung",
            ],
        },
    ],
};


export const adhsContent = {
    title: "ADHS",
    boxes: [
        {
            title: "Definition",
            text: "ADHS ist eine Hyperaktivitätsstörung. Sie betrifft Aufmerksamkeit, Impulsivität und Aktivität und kann Alltag, Schule, Arbeit und Beziehungen beeinflussen.",
        },
        {
            title: "Häufige Symptome",
            points: [
                "Konzentrationsprobleme",
                "Leichte Ablenkbarkeit",
                "Impulsivität",
                "Innere Unruhe oder Hyperaktivität",
                "Vergesslichkeit",
            ],
        },
        {
            title: "Formen",
            points: [
                "Vorwiegend unaufmerksamer Typ",
                "Vorwiegend hyperaktiv-impulsiver Typ",
                "Kombinierter Typ",
            ],
        },
        {
            title: "Ursachen",
            points: [
                "Genetische Faktoren",
                "Veränderungen im Gehirnstoffwechsel",
                "Umwelt- und Belastungsfaktoren",
                "Familiäre und psychosoziale Einflüsse",
            ],
        },
    ],
};

export const KVTherapieContent = {
    title: "Kognitive Verhaltenstherapie (KVT)",
    boxes: [
        {
            title: "Definition",
            text: "Die kognitive Verhaltenstherapie ist eine Psychotherapieform. Sie hilft dabei, negative Gedanken und problematisches Verhalten zu erkennen und zu verändern.",

        },
        {
            title: "Ziele der Therapie",
            points: [
                "Bessere Selbstkontrolle",
                "Gefühle regulieren",
                "Probleme lösen",
                "Alltag strukturieren",
                "Konzentration verbessern",
            ],
        },
        {
            title: "Methoden",
            points: [
                "Gespräche mit dem Therapeuten",
                "Übungen für den Alltag",
                "Training von Aufmerksamkeit und Organisation",
                "Gedanken hinterfragen",
            ],
        },
        {
            title: "Einsatz bei ADHS",
            points: [
                "Impulsives Verhalten zu kontrollieren",
                "Aufgaben besser zu planen",
                "Stress zu reduzieren",
                "Alltag besser zu organisieren.",
            ],
        },
    ],
};

export const SuchttherapieContent = {
    title: "Suchttherapie",
    boxes: [
        {
            title: "Definition",
            text: "Suchttherapie ist eine Therapieform zur Behandlung von Alkoholabhängigkeit und anderen Suchterkrankungen. Sie hilft Betroffenen, den Konsum zu reduzieren oder abstinent zu leben und den Alltag wieder zu stabilisieren.",
        },
        {
            title: "Ziele der Therapie",
            points: [
                "Alkoholabhängigkeit behandeln",
                "Rückfälle vermeiden",
                "Körperliche und psychische Gesundheit verbessern",
                "Soziale Beziehungen stärken",
                "Selbstständigen Alltag fördern",
            ],
        },
        {
            title: "Methoden",
            points: [
                "Entzugsbehandlung",
                "Einzel- und Gruppengespräche",
                "Verhaltenspläne",
                "Unterstützung durch Angehörige",
            ],
        },
        {
            title: "Einsatz bei alkoholbezogenen Störungen",
            points: [
                "psychotherapeutischer Behandlung",
                "Medizinischer Betreuung",
                "Sozialer Unterstützung",
                "Langfristiger Nachsorge",
            ],
        },
    ],
};


export const DBTherapieContent = {
    title: "Dialektisch-Behaviorale Therapie (DBT)",
    boxes: [
        {
            title: "Definition",
            text: "Dialektisch-Behaviorale Therapie (DBT) ist eine spezielle Therapieform für Menschen mit einer Borderline-Persönlichkeitsstörung. Sie kombiniert Verhaltenstherapie mit Übungen zur Gefühlsregulation und Achtsamkeit.",
        },
        {
            title: "Ziele der Therapie",
            points: [
                "Starke Gefühle besser kontrollieren",
                "Impulsives Verhalten reduzieren",
                "Selbstverletzungen vermeiden",
                "Beziehungen verbessern",
                "Stress besser bewältigen",
            ],
        },
        {
            title: "Methoden",
            points: [
                "Einzeltherapie",
                "Gruppentraining",
                "Achtsamkeitsübungen",
                "Training sozialer Fähigkeiten",
                "Übungen zur Emotionsregulation",
            ],
        },
        {
            title: "Einsatz bei Borderline-Persönlichkeitsstörung",
            points: [
                "Gefühle besser zu steuern",
                "Beziehungen zu stabilisieren",
                "Selbstschädigendes Verhalten zu verringern",
            ],
        },
    ],
};