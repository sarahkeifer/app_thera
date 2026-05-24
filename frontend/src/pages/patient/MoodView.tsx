import { useState } from 'react';

const moods = [
    { emoji: '🌞', label: 'Leicht', value: 5, color: 'bg-yellow-100 border-yellow-300' },
    { emoji: '🌿', label: 'Ruhig', value: 4, color: 'bg-green-100 border-green-300' },
    { emoji: '☁️', label: 'Neutral', value: 3, color: 'bg-slate-100 border-slate-300' },
    { emoji: '🌧️', label: 'Niedergeschlagen', value: 2, color: 'bg-blue-100 border-blue-300' },
    { emoji: '🌪️', label: 'Überfordert', value: 1, color: 'bg-purple-100 border-purple-300' },
];

interface MoodEntry {
    id: string;
    date: string;
    mood: number;
    note: string;
}

export default function MoodView() {
    const [entries, setEntries] = useState<MoodEntry[]>([]);
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'visual'>('list');

    const handleSave = () => {
        if (!selectedMood) return;

        const newEntry: MoodEntry = {
            id: crypto.randomUUID(),
            date: new Date().toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'short',
            }),
            mood: selectedMood,
            note,
        };

        setEntries([newEntry, ...entries]);
        setSelectedMood(null);
        setNote('');
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
                        placeholder="Was hat zu dieser Stimmung geführt?"
                        className="mood-textarea"
                    />

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
        </div>
    );
}