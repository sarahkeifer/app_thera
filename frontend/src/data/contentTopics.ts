/**
 * contentTopics (Datenmodul)
 * ============================================================================
 * Zweck: Enthält die statischen Lerninhalt-Themen (Krankheitsbilder /
 * Therapieformen) inklusive Kategorie-Zuordnung, die in `TaskView` und
 * `PsychoCard` gerendert werden. Reine Datendefinition ohne UI-Logik –
 * daher keine KoliBri-Komponenten und keine responsive Logik notwendig.
 */

import {
    adhsContent,
    angstContent,
    depressionContent,
    KVTherapieContent,
    SuchttherapieContent,
    DBTherapieContent,
} from "./psychoContent";

export type ContentCategory = "krankheiten" | "therapieformen";

// Die "key"-Werte müssen exakt den Konstanten des Backend-Enums
// com.example.demo.entity.ContentTopic entsprechen.
export type ContentTopicKey = "ADHS" | "DEPRESSION" | "ANGST" | "KVT" | "SUCHTTHERAPIE" | "DBT";

export type ContentTopic = {
    key: ContentTopicKey;
    title: string;
    category: ContentCategory;
    content: typeof adhsContent;
    source: string;
};

export const contentTopics: ContentTopic[] = [
    {
        key: "ADHS",
        title: "ADHS",
        category: "krankheiten",
        content: adhsContent,
        source: "ICD-10, Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
    },
    {
        key: "DEPRESSION",
        title: "Depression",
        category: "krankheiten",
        content: depressionContent,
        source: "ICD-10, Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
    },
    {
        key: "ANGST",
        title: "Angststörung",
        category: "krankheiten",
        content: angstContent,
        source: "ICD-10, Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
    },
    {
        key: "KVT",
        title: "Kognitive Verhaltenstherapie (KVT)",
        category: "therapieformen",
        content: KVTherapieContent,
        source: "Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
    },
    {
        key: "SUCHTTHERAPIE",
        title: "Suchttherapie",
        category: "therapieformen",
        content: SuchttherapieContent,
        source: "Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
    },
    {
        key: "DBT",
        title: "Dialektisch-Behaviorale Therapie (DBT)",
        category: "therapieformen",
        content: DBTherapieContent,
        source: "Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
    },
];
