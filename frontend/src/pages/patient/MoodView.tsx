import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    KolButton,
    KolCard,
    KolHeading,
    KolTextarea
} from "@public-ui/react-v19";

const moods = [
    { emoji: '🤩', label: 'Sehr gut', value: 5 },
    { emoji: '😊', label: 'Gut', value: 4 },
    { emoji: '😐', label: 'Okay', value: 3},
    { emoji: '😔', label: 'Nicht gut', value: 2 },
    { emoji: '😢', label: 'Schlecht', value: 1 },
];
interface MoodEntry {
    id: string;
    createdAt: string;
    mood: number;
    note: string;
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
                <KolCard _label="" _variant="dialog">
                    <KolHeading
                        _level={2}
                        _label={editingEntry ? "Stimmung bearbeiten" : "Stimmung eintragen"}
                    />

                    <div className="mood-grid">
                        {moods.map((mood) => (
                            <KolButton
                                key={mood.value}
                                _label={`${mood.emoji} ${mood.label}`}
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

                <KolCard _label="" _variant="history">
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
                        <div className="mood-chart">
                            {[...entries].reverse().map((entry) => {
                                const mood = moods.find((m) => m.value === entry.mood);

                                return (
                                    <div className="mood-chart-item" key={entry.id}>
                                        <div
                                            className="mood-chart-bar"
                                            style={{height: `${entry.mood * 30}px`}}
                                        >
                                            {mood?.emoji}
                                        </div>

                                        <small>
                                            {new Date(entry.createdAt).toLocaleDateString("de-DE", {
                                                day: "2-digit",
                                                month: "short",
                                            })}
                                        </small>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        entries.map((entry) => {
                            const mood = moods.find((m) => m.value === entry.mood);

                            return (
                                <KolCard _label=" " _variant="history-item" key={entry.id}>
                                    <div className="mood-history-item-inner">
                                        <span className="mood-history-emoji">{mood?.emoji}</span>

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
                        <KolCard _label="" _variant="dialog">
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