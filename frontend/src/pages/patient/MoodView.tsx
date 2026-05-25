import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const moods = [
    { emoji: '✨', label: 'Sehr gut', value: 5, color: 'bg-yellow-100 border-yellow-300' },
    { emoji: '🌿', label: 'Gut', value: 4, color: 'bg-green-100 border-green-300' },
    { emoji: '☁️', label: 'Okay', value: 3, color: 'bg-slate-100 border-slate-300' },
    { emoji: '🌧️', label: 'Nicht gut', value: 2, color: 'bg-blue-100 border-blue-300' },
    { emoji: '🌪️', label: 'Schlecht', value: 1, color: 'bg-purple-100 border-purple-300' },
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

    useEffect(() => {
        fetch("http://localhost:8080/api/moods")
            .then((res) => res.json())
            .then((data) => setEntries(data));
    }, []);

    const handleSave = async () => {
        if (!selectedMood) {
            setError("Bitte eine Stimmung auswählen");
            return;
        }

        const response = await fetch("http://localhost:8080/api/moods", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                mood: selectedMood,
                note: note,
            }),
        });

        const savedEntry = await response.json();

        setEntries([savedEntry, ...entries]);
        setSelectedMood(null);
        setNote("");
        setShowDialog(false);
    };

    return (
        <div className="mood-page">

            <div className="mood-header">
                <h1 className="mood-title">Stimmungs-Tracker</h1>

                <p className="mood-subtitle">
                    Wie fühlst du dich gerade?
                </p>
            </div>

            <button
                onClick={() => setShowDialog(true)}
                className="mood-add-button"
            >
                + Eintrag hinzufügen
            </button>

            {showDialog && (
                <div className="mood-dialog">

                    <h2 className="mood-dialog-title">
                        Stimmung eintragen
                    </h2>

                    <div className="mood-grid">

                        {moods.map((mood) => (
                            <button
                                key={mood.value}
                                onClick={() => setSelectedMood(mood.value)}
                                className={`mood-button ${
                                    selectedMood === mood.value
                                        ? "mood-button-active"
                                        : ""
                                }`}
                            >
              <span className="mood-emoji">
                {mood.emoji}
              </span>

                                <span className="mood-label">
                {mood.label}
              </span>
                            </button>
                        ))}

                    </div>

                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Was hat zu dieser Stimmung geführt? (Optional)"
                        className="mood-textarea"
                    />
                    {error && (
                        <p className="mood-error">
                            {error}
                        </p>
                    )}

                    <div className="mood-dialog-actions">

                        <button
                            onClick={() => setShowDialog(false)}
                            className="mood-cancel-button"
                        >
                            Abbrechen
                        </button>

                        <button
                            onClick={handleSave}
                            className="mood-save-button"
                        >
                            Speichern
                        </button>

                    </div>
                </div>
            )}

            <div className="mood-history">
                <h2>Verlauf</h2>

                {entries.length === 0 ? (
                    <p>Noch keine Einträge vorhanden.</p>
                ) : (
                    entries.map((entry) => {
                        const mood = moods.find((m) => m.value === entry.mood);

                        return (
                            <div className="mood-history-item" key={entry.id}>
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
                                    </div>

                                    {entry.note && (
                                        <p className="mood-history-note">{entry.note}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}