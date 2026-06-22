import { useState } from "react";
import PsychoCard from "../../components/PsychoCard";
import {
    depressionContent,
    angstContent,
    adhsContent,
    KVTherapieContent, SuchttherapieContent, DBTherapieContent,
} from "../../data/psychoContent";
import { KolButton, KolCard, KolHeading } from "@public-ui/react-v19";

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
    const psychoContentMap = {
        depression: {
            content: depressionContent,
            source: "ICD-10, Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
        },
        angst: {
            content: angstContent,
            source: "ICD-10, Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
        },
        adhs: {
            content: adhsContent,
            source: "ICD-10, Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
        },
        "Kognitive Verhaltenstherapie (KVT)": {
            content: KVTherapieContent,
            source: "Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
        },
        SuchttherapieContent: {
            content: SuchttherapieContent,
            source: "Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
        },
        DBTherapieContent: {
            content: DBTherapieContent,
            source: "Deutsche Gesellschaft für Psychiatrie und Psychotherapie",
        },
    };
    const selectedContent =
        psychoContentMap[
            selectedCategory as keyof typeof psychoContentMap
            ];

    return (
        <div className="task-page">
            <KolHeading
                _level={1}
                _label="Aufgaben"
            />
            {/* Zahl muss dynamisch sein */}
            <p className="task-subtitle">
                3 offene Aufgaben
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

            {(filter === "all" || filter === "psychoedukation") && (

                <>
                    {selectedCategory === "" && (

                        <div className="task-card-list">

                            {psychoedukationCards.map((card) => (

                                <KolCard
                                    _label=""
                                    className="task-card"
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
                    )}

                    {selectedCategory === "krankheiten" && (
                        <div className="task-card-list">

                            <KolCard
                                _label="ADHS"
                                className="task-card"
                                onClick={() => setSelectedCategory("adhs")}
                            />


                            <KolCard
                                _label="Depression"
                                className="task-card"
                                onClick={() => setSelectedCategory("depression")}
                            />

                            <KolCard
                                _label="Angststörung"
                                className="task-card"
                                onClick={() => setSelectedCategory("angst")}
                            />

                        </div>
                    )}

                    {selectedCategory === "therapieformen" && (
                        <div className="task-card-list">

                            <KolCard
                                _label="Kognitive Verhaltenstherapie (KVT)"
                                className="task-card"
                                onClick={() => setSelectedCategory("Kognitive Verhaltenstherapie (KVT)")}
                            />


                            <KolCard
                                _label="Suchttherapie"
                                className="task-card"
                                onClick={() => setSelectedCategory("SuchttherapieContent")}
                            />

                            <KolCard
                                _label="Dialektisch-Behaviorale Therapie (DBT)"
                                className="task-card"
                                onClick={() => setSelectedCategory("DBTherapieContent")}
                            />

                        </div>
                    )}

                    {selectedContent && (
                        <PsychoCard
                            title={selectedContent.content.title}
                            boxes={selectedContent.content.boxes}
                            source={selectedContent.source}
                        />
                    )}
                </>
            )}
        </div>
    );
}