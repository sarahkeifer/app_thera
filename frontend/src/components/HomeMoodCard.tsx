import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const moods = [
    { emoji: '✨', label: 'Sehr gut', value: 5 },
    { emoji: '🌿', label: 'Gut', value: 4 },
    { emoji: '☁️', label: 'Okay', value: 3 },
    { emoji: '🌧️', label: 'Nicht gut', value: 2 },
    { emoji: '🌪️', label: 'Schlecht', value: 1 },
];

export default function HomeMoodCard() {
    const navigate = useNavigate();

    const [pendingMood, setPendingMood] =
        useState<number | null>(null);

    const selectedMood = moods.find(
        (m) => m.value === pendingMood
    );

    return (
        <>
            <div className="home-mood-card">

                <div className="home-mood-header">
                    <div className="home-mood-icon">❤</div>

                    <h2 className="home-mood-title">
                        Heutige Stimmung
                    </h2>
                </div>

                <div className="home-mood-row">
                    {moods.map((mood) => (
                        <button
                            key={mood.value}
                            onClick={() => setPendingMood(mood.value)}
                            className="home-mood-button"
                        >
                            {mood.emoji}
                        </button>
                    ))}
                </div>
            </div>

            {pendingMood && (
                <div className="home-mood-overlay">
                    <div className="home-mood-dialog">

                        <div className="home-mood-selected">
                            {selectedMood?.emoji}
                        </div>

                        <p>
                            Möchtest du deine Stimmung als Eintrag speichern?
                        </p>

                        <div className="home-mood-actions">

                            <button
                                onClick={() => setPendingMood(null)}
                            >
                                Nein
                            </button>

                            <button
                                onClick={() =>
                                    navigate('/patient/moodview', {
                                        state: {
                                            mood: pendingMood,
                                        },
                                    })
                                }
                            >
                                Ja
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}