/**
 * BreathingExercise
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Vollflächiges Overlay mit einer geführten Box-Atemübung (4-4-4-4:
 * Einatmen – Halten – Ausatmen – Halten, je 4 Sekunden). Wird vom
 * `PanicButton` geöffnet, wenn eine Person in einer akuten Stress-/
 * Paniksituation schnelle Beruhigungshilfe braucht.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - Der Atem-Kreis wird rein per CSS-Keyframe-Animation skaliert (ruckelfrei,
 *   unabhängig vom React-Render-Zyklus).
 * - Ein `setInterval` läuft synchron zur CSS-Animation und schaltet nur den
 *   Anzeige-Text (Einatmen/Halten/Ausatmen/Halten) um; beide starten beim
 *   Mounten der Komponente gemeinsam bei 0, bleiben also im Gleichlauf.
 * - Enthält zusätzlich einen Hinweis auf die Telefonseelsorge für Situationen,
 *   die über eine Atemübung hinausgehen.
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * - Bewusst als eigenständiges Overlay (nicht die bestehende
 *   `.home-mood-overlay`-Karte) umgesetzt: Die Übung soll den ganzen
 *   Bildschirm einnehmen und beruhigend wirken, nicht wie ein Formular-Dialog.
 * - Keine Zählung von Zyklen/Zeitlimit: Die Person entscheidet selbst, wann
 *   die Übung beendet ist ("Beenden"-Button jederzeit erreichbar).
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Kreisgröße und Typografie sind in `clamp()` definiert (siehe
 * `breathing-circle`/`breathing-phase` in `index.css`), damit die Übung auf
 * kleinen Handy-Displays genauso funktioniert wie auf großen Tablets.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton (Beenden), KolIcon (Lungen-/Telefon-Icon).
 */

import { useEffect, useState } from "react";
import { KolButton, KolIcon } from "@public-ui/react-v19";

const PHASES = ["Einatmen", "Halten", "Ausatmen", "Halten"];
const PHASE_DURATION_MS = 4000;

export default function BreathingExercise({ onClose }: { onClose: () => void }) {
    const [phaseIndex, setPhaseIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPhaseIndex((prev) => (prev + 1) % PHASES.length);
        }, PHASE_DURATION_MS);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="breathing-overlay">
            <div className="breathing-header">
                <KolIcon _icons="icofont icofont-lungs" _label="" />
                <p>Nimm dir einen Moment Zeit.</p>
            </div>

            <div className="breathing-stage">
                <p className="breathing-phase">{PHASES[phaseIndex]}</p>
                <div className="breathing-circle" />
            </div>

            <div className="breathing-help">
                <KolIcon _icons="icofont icofont-telephone" _label="" />
                <p>
                    Brauchst du sofort Hilfe? Die Telefonseelsorge ist kostenlos,
                    anonym und rund um die Uhr erreichbar: <strong>0800&nbsp;111&nbsp;0&nbsp;111</strong>
                </p>
            </div>

            <div className="breathing-close">
                <KolButton _label="Beenden" _variant="secondary" _on={{ onClick: onClose }} />
            </div>
        </div>
    );
}
