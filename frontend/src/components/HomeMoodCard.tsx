import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KolButton, KolCard, KolHeading } from "@public-ui/react-v19";

const moods = [
    { emoji: '🤩', label: 'Sehr gut', value: 5 },
    { emoji: '😊', label: 'Gut', value: 4 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '😔', label: 'Nicht gut', value: 2 },
    { emoji: '😢', label: 'Schlecht', value: 1 },
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
            <KolCard className="mood" _label={""}>
                <div className="home-mood-header">
                    <div className="home-mood-icon">❤</div>
                    <KolHeading _level={2} _label="Heutige Stimmung" />
                </div>

                <div className="home-mood-row">
                    {moods.map((mood) => (
                        <KolButton
                            key={mood.value}
                            _label={mood.emoji}
                            _hideLabel={false}
                            _variant="secondary"
                            _on={{ onClick: () => setPendingMood(mood.value) }}
                        />
                    ))}
                </div>
            </KolCard>

            {pendingMood && (
                <div className="home-mood-overlay">
                    <KolCard class="dialog" _label={""}>
                        <div className="home-mood-question">
                        <span className="home-mood-selected">
                            {selectedMood?.emoji}
                        </span>
                            <p>Möchtest du deine Stimmung speichern?</p>
                        </div>

                        <div className="home-mood-actions">
                            <div className="mood-btn">
                                <KolButton
                                    _label="Nein"
                                    _variant="secondary"
                                    _on={{onClick: () => setPendingMood(null)}}
                                />
                            </div>

                            <div className="mood-btn">
                                <KolButton
                                    _label="Ja"
                                    _on={{
                                        onClick: () => {
                                            navigate("/patient/moodview", {
                                                state: {mood: pendingMood},
                                            });
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </KolCard>
                </div>
            )}
        </>
    );
}