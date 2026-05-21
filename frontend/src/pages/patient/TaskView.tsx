import { useState } from "react";

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

    return (
        <div className="task-page">
            <h1 className="task-title">Aufgaben</h1>
            {/* Zahl muss dynamisch sein */}
            <p className="task-subtitle">
                3 offene Aufgaben
            </p>

            <div className="task-filter-row">

                <button
                    onClick={() => setFilter("all")}
                    className={`task-filter-button ${filter === "all" ? "task-filter-button-active" : ""}`}
                >
                    Alle
                </button>

                <button
                    onClick={() => setFilter("psychoedukation")}
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
                <div className="task-card-list">
                    {psychoedukationCards.map((card) => (
                        <div className="task-card" key={card.title}>
                            <h2 className="task-card-title">{card.title}</h2>
                            <p className="task-card-description">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}