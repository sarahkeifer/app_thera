/**
 * HomeMoodCard
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Widget auf der Patienten-Startseite, mit dem die aktuelle Tagesstimmung
 * schnell ausgewählt werden kann. Nach Auswahl eines Stimmungs-Icons wird
 * eine Bestätigungs-Nachfrage angezeigt; bei Bestätigung erfolgt die
 * Weiterleitung zur ausführlichen Stimmungs-Erfassung (`MoodView`), die den
 * eigentlichen Speichervorgang übernimmt.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - Rendert eine Reihe von Stimmungs-Buttons (aus `data/moods.ts`).
 * - Verwaltet lediglich den lokalen UI-Zwischenzustand `pendingMood`
 *   (noch nicht bestätigte Auswahl); es findet hier kein Backend-Zugriff
 *   statt – das Speichern übernimmt `MoodView` über den Navigations-State.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * react-router-dom (useNavigate), @public-ui/react-v19 (KolButton, KolCard,
 * KolHeading, KolIcon), data/moods.ts.
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Die Bestätigungs-Nachfrage ist als eigenes Overlay statt als separate
 * Route umgesetzt, damit die Auswahl ohne Seitenwechsel schnell korrigiert
 * werden kann (Antippen außerhalb / "Nein" verwirft die Auswahl sofort).
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Die Stimmungs-Buttons (`.home-mood-row`) verteilen sich per Flexbox
 * gleichmäßig über die verfügbare Breite und behalten dank fester
 * Mindestgröße (`--button-width`) ausreichend große Touch-Flächen; auf
 * schmalen Displays brechen sie bei Bedarf um.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolCard, KolHeading, KolIcon.
 */

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
                    <KolIcon
                        className="home-mood-icon"
                        _icons="icofont icofont-simple-smile"
                        _label="Stimmung"
                    />
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
