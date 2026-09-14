import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KolButton, KolCard, KolHeading, KolIcon } from "@public-ui/react-v19";
import { moods } from "../data/moods";

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
                            _icons={mood.icon}
                            _label={mood.label}
                            _hideLabel
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
                                {selectedMood && (
                                    <KolIcon _icons={selectedMood.icon} _label={selectedMood.label} />
                                )}
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
