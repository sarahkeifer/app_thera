import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    KolButton,
    KolCard,
    KolHeading,
    KolIcon,
    KolTextarea
} from "@public-ui/react-v19";
import { moods, getMoodByValue } from "../../data/moods";

interface MoodEntry {
    id: string;
    createdAt: string;
    mood: number;
    note: string;
}

// Rot-Grün-Farbskala für die 7 Stimmungsstufen (1 = sehr schlecht, 7 = ausgezeichnet).
const moodLineColors = ["#dc2626", "#ea580c", "#f59e0b", "#eab308", "#84cc16", "#65a30d", "#16a34a"];

function moodColor(value: number): string {
    return moodLineColors[value - 1] ?? "#888780";
}

function MoodLineChart({ entries }: { entries: MoodEntry[] }) {
    const chronological = [...entries].reverse();

    const width = 700;
    const height = 220;
    const paddingX = 24;
    const paddingTop = 20;
    const paddingBottom = 36;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingTop - paddingBottom;

    const points = chronological.map((entry, index) => {
        const x =
            chronological.length === 1
                ? paddingX + plotWidth / 2
                : paddingX + (index / (chronological.length - 1)) * plotWidth;
        const y = paddingTop + plotHeight - ((entry.mood - 1) / 6) * plotHeight;

        return { x, y, entry };
    });

    const linePath = points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ");

    const labelEvery = Math.max(1, Math.ceil(points.length / 8));

    return (
        <div className="mood-line-chart">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="mood-line-chart-svg"
                role="img"
                aria-label="Verlauf der eingetragenen Stimmungen über die Zeit"
            >
                {[1, 4, 7].map((level) => {
                    const y = paddingTop + plotHeight - ((level - 1) / 6) * plotHeight;

                    return (
                        <g key={level}>
                            <line
                                x1={paddingX}
                                y1={y}
                                x2={width - paddingX}
                                y2={y}
                                className="mood-line-chart-grid"
                            />
                            <text
                                x={paddingX - 8}
                                y={y + 4}
                                className="mood-line-chart-axis-label"
                                textAnchor="end"
                            >
                                {level}
                            </text>
                        </g>
                    );
                })}

                {points.length > 1 && <path d={linePath} className="mood-line-chart-line" fill="none" />}

                {points.map((point, index) => (
                    <g key={point.entry.id}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={6}
                            fill={moodColor(point.entry.mood)}
                            stroke="#fff"
                            strokeWidth={2}
                        >
                            <title>
                                {new Date(point.entry.createdAt).toLocaleDateString("de-DE", {
                                    day: "2-digit",
                                    month: "short",
                                })}
                                {": "}
                                {getMoodByValue(point.entry.mood)?.label}
                            </title>
                        </circle>

                        {index % labelEvery === 0 && (
                            <text
                                x={point.x}
                                y={height - 10}
                                className="mood-line-chart-date-label"
                                textAnchor="middle"
                            >
                                {new Date(point.entry.createdAt).toLocaleDateString("de-DE", {
                                    day: "2-digit",
                                    month: "short",
                                })}
                            </text>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
}

export default function MoodView() {
    const location = useLocation();
    const initialMood = location.state?.mood || null;
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [selectedMood, setSelectedMood] = useState<number | null>(initialMood);
    const [note, setNote] = useState('');
    const [showDialog, setShowDialog] = useState(!!initialMood);
    const [viewMode, setViewMode] = useState<'list' | 'visual'>('list');
    const [error, setError] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);

    useEffect(() => {
        fetch("http://localhost:8080/api/moods", {
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        })
            .then((res) => res.json())
            .then((data) => setEntries(data));
    }, []);

    const handleSave = async () => {
        if (!selectedMood) {
            setError("Bitte eine Stimmung auswählen");
            return;
        }

        const url = editingEntry
            ? `http://localhost:8080/api/moods/${editingEntry.id}`
            : "http://localhost:8080/api/moods";

        const method = editingEntry ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": localStorage.getItem("userId") || "",
            },
            body: JSON.stringify({
                mood: selectedMood,
                note: note,
            }),
        });

        const savedEntry = await response.json();

        if (editingEntry) {
            setEntries(entries.map((entry) =>
                entry.id === editingEntry.id ? savedEntry : entry
            ));
        } else {
            setEntries([savedEntry, ...entries]);
        }

        setEditingEntry(null);
        setSelectedMood(null);
        setNote("");
        setError("");
        setShowDialog(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        await fetch(`http://localhost:8080/api/moods/${deleteId}`, {
            method: "DELETE",
            headers: {
                "X-User-Id": localStorage.getItem("userId") || "",
            },
        });

        setEntries(entries.filter((e) => e.id !== deleteId));
        setDeleteId(null);
        setShowDeleteDialog(false);
    };

    return (
        <div className="mood-page">

            <div className="mood-header">
                <KolHeading
                    _level={1}
                    _label="Stimmungs-Tracker"
                />

                <p className="mood-subtitle">
                    Wie fühlst du dich gerade?
                </p>
            </div>

            <div className="mood-add-row">
                <KolButton
                    _label="+ Eintrag hinzufügen"
                    _on={{
                        onClick: () => {
                            setEditingEntry(null);
                            setSelectedMood(null);
                            setNote("");
                            setError("");
                            setShowDialog(true);
                        }
                    }}
                />
            </div>

            {showDialog && (
                <KolCard _label="" className="dialog">
                    <KolHeading
                        _level={2}
                        _label={editingEntry ? "Stimmung bearbeiten" : "Stimmung eintragen"}
                    />

                    <div className="mood-grid">
                        {moods.map((mood) => (
                            <KolButton
                                key={mood.value}
                                _icons={mood.icon}
                                _label={mood.label}
                                _hideLabel
                                _variant={selectedMood === mood.value ? "primary" : "secondary"}
                                _on={{
                                    onClick: () => {
                                        setSelectedMood(mood.value);
                                        setError("");
                                    }
                                }}
                            />
                        ))}
                    </div>

                    <KolTextarea
                        _label="Notiz"
                        _placeholder="Was hat zu dieser Stimmung geführt? (Optional)"
                        _hideLabel
                        _value={note}
                        _on={{
                            onInput: (_e, value) => setNote(String(value))
                        }}
                    />

                    <div className="mood-error">
                        {error}
                    </div>

                    <div className="mood-dialog-actions">
                        <KolButton
                            _label="Abbrechen"
                            _variant="secondary"
                            _on={{onClick: () => setShowDialog(false)}}
                        />

                        <KolButton
                            _label="Speichern"
                            _on={{onClick: handleSave}}
                        />
                    </div>
                </KolCard>
            )}

                <KolCard _label="" className="history">
                    <KolHeading
                        _level={2}
                        _label="Verlauf"
                    />

                <div className="mood-history-header">

                    <KolButton
                        _label={
                            viewMode === "list"
                                ? "Als Grafik anzeigen"
                                : "Als Liste anzeigen"
                        }
                        _on={{
                            onClick: () =>
                                setViewMode(viewMode === "list" ? "visual" : "list")
                        }}
                    />
                </div>

                <div className="mood-history-content-wrapper">
                    {entries.length === 0 ? (
                        <p>Noch keine Einträge vorhanden.</p>
                    ) : viewMode === "visual" ? (
                        <MoodLineChart entries={entries} />
                    ) : (
                        entries.map((entry) => {
                            const mood = getMoodByValue(entry.mood);

                            return (
                                <KolCard _label=" " className="history-item" key={entry.id}>
                                    <div className="mood-history-item-inner">
                                        <span className="mood-history-emoji">
                                            {mood && (
                                                <KolIcon _icons={mood.icon} _label={mood.label} />
                                            )}
                                        </span>

                                        <div className="mood-history-content">
                                            <div className="mood-history-top">
                                                <p className="mood-history-date">
                                                    {entry.createdAt
                                                        ? new Date(entry.createdAt).toLocaleDateString("de-DE", {
                                                            day: "2-digit",
                                                            month: "short",
                                                        })
                                                        : "Heute"}
                                                </p>

                                                <p className="mood-history-label">{mood?.label}</p>
                                                <div className="mood-actions">
                                                <KolButton
                                                    _label="✏️"
                                                    _variant="secondary"
                                                    _on={{
                                                        onClick: () => {
                                                            setEditingEntry(entry);
                                                            setSelectedMood(entry.mood);
                                                            setNote(entry.note);
                                                            setError("");
                                                            setShowDialog(true);
                                                            window.scrollTo({
                                                                top: 0,
                                                                behavior: "smooth"
                                                            });
                                                        },
                                                    }}
                                                />
                                                <KolButton
                                                    _label="✖️"
                                                    _variant="secondary"
                                                    _on={{
                                                        onClick: () => {
                                                            setDeleteId(entry.id);
                                                            setShowDeleteDialog(true);
                                                        },
                                                    }}
                                                />
                                                </div>
                                            </div>

                                            {entry.note ? (
                                                <p className="mood-history-note">{entry.note}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </KolCard>
                            );
                        })
                    )}
                </div>
            </KolCard>

            {showDeleteDialog && (
                <div className="home-mood-overlay">
                    <div className="delete-dialog">
                        <KolCard _label="" className="dialog">
                        <p>Möchtest du diese Stimmung löschen?</p>

                        <div className="home-mood-actions">
                            <div className="mood-btn">
                                <KolButton
                                    _label="Nein"
                                    _variant="secondary"
                                    _on={{
                                        onClick: () => {
                                            setShowDeleteDialog(false);
                                            setDeleteId(null);
                                        },
                                    }}
                                />
                            </div>

                            <div className="mood-btn">
                                <KolButton
                                    _label="Ja"
                                    _on={{ onClick: handleDelete }}
                                />
                            </div>
                        </div>
                    </KolCard>
                    </div>
                </div>
            )}

        </div>
    );
}