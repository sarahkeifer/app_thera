import { useState } from "react";
import PsychoCard from "../../components/PsychoCard";
import {
    depressionContent,
    angstContent,
    adhsContent,
} from "../../data/psychoContent";

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
    return (
        <div className="task-page">
            <h1 className="task-title">Aufgaben</h1>
            {/* Zahl muss dynamisch sein */}
            <p className="task-subtitle">
                3 offene Aufgaben
            </p>

            <div className="task-filter-row">

                <button
                    onClick={() =>{
                        setFilter("all");
                        setSelectedCategory("");
                }}
                    className={`task-filter-button ${filter === "all" ? "task-filter-button-active" : ""}`}
                >
                    Alle
                </button>

                <button
                    onClick={() => {
                        setFilter("psychoedukation");
                        setSelectedCategory("");
                    }}
                    className={`task-filter-button ${filter === "psychoedukation" ? "task-filter-button-active" : ""}`}
                >
                    Psychoedukation
                </button>

                <button
                    onClick={() => setFilter("aktivitaet")}
                    className={`task-filter-button ${filter === "aktivitaet" ? "task-filter-button-active" : ""}`}
                >
                    Aktivität
                </button>

                <button
                    onClick={() => setFilter("reflexion")}
                    className={`task-filter-button ${filter === "reflexion" ? "task-filter-button-active" : ""}`}
                >
                    Reflexion
                </button>
            </div>

            {(filter === "all" || filter === "psychoedukation") && (

                <>
                    {selectedCategory === "" && (

                        <div className="task-card-list">

                            {psychoedukationCards.map((card) => (

                                <div
                                    className="task-card"
                                    key={card.title}
                                    onClick={() => {
                                        if (card.title === "Krankheiten") {
                                            setSelectedCategory("krankheiten");
                                        }
                                    }}
                                >
                                    <h2 className="task-card-title">
                                        {card.title}
                                    </h2>

                                    <p className="task-card-description">
                                        {card.description}
                                    </p>

                                </div>
                            ))}
                        </div>
                    )}

                    {selectedCategory === "krankheiten" && (
                        <div className="task-card-list">

                            <div
                                className="task-card"
                                onClick={() => setSelectedCategory("adhs")}
                            >
                                <h2 className="task-card-title">ADHS</h2>
                            </div>

                            <div
                                className="task-card"
                                onClick={() => setSelectedCategory("depression")}
                            >
                                <h2 className="task-card-title">Depression</h2>
                            </div>

                            <div
                                className="task-card"
                                onClick={() => setSelectedCategory("angst")}
                            >
                                <h2 className="task-card-title">Angststörung</h2>
                            </div>

                        </div>
                    )}

                    {selectedCategory === "depression" && (
                        <PsychoCard
                            title={depressionContent.title}
                            boxes={depressionContent.boxes}
                            source=" ICD-10, Deutsche Gesellschaft für Psychiatrie und Psychotherapie"
                        />
                    )}

                    {selectedCategory === "angst" && (
                        <PsychoCard
                            title={angstContent.title}
                            boxes={angstContent.boxes}
                            source=" ICD-10, Deutsche Gesellschaft für Psychiatrie und Psychotherapie"
                        />
                    )}

                    {selectedCategory === "adhs" && (
                        <PsychoCard
                            title={adhsContent.title}
                            boxes={adhsContent.boxes}
                            source=" ICD-10, Deutsche Gesellschaft für Psychiatrie und Psychotherapie"
                        />
                    )}
                </>
            )}
        </div>
    );
}