/**
 * PanicButton
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Jederzeit erreichbarer Notfall-Button für Patient:innen. Rendert einen
 * fest positionierten Floating-Button (angelehnt an `.logout-btn` in
 * `App.css`) und öffnet bei Klick die `BreathingExercise` als Overlay.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - Verwaltet ausschließlich den offen/geschlossen-Zustand des Overlays
 *   (`isOpen`), keine weitere Logik.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * `BreathingExercise` (Atemübungs-Overlay).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * - Wird direkt in `App.tsx` neben `PatientNav` gerendert (nicht in einer
 *   einzelnen Unterseite), damit der Button auf allen Patienten-Routen
 *   erreichbar ist - ein Panikbutton nützt nichts, wenn er nur auf einer
 *   bestimmten Seite sichtbar ist.
 * - Bewusst visuell von allen anderen Buttons abgesetzt (warmer Farbton,
 *   siehe `.panic-btn` in `App.css`), damit er im Ernstfall sofort auffindbar
 *   ist, ohne im Alltag aufdringlich zu wirken.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * 56x56px Touch-Ziel (deutlich über der WCAG-Mindestgröße von 44px), fest
 * positioniert oberhalb der Bottom-Navigation auf allen Breakpoints.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolIcon (Rettungsring-Icon).
 */

import { useState } from "react";
import { KolIcon } from "@public-ui/react-v19";
import BreathingExercise from "../pages/patient/BreathingExercise.tsx";

export default function PanicButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="panic-btn"
                onClick={() => setIsOpen(true)}
                aria-label="Ich brauche jetzt Hilfe"
            >
                <KolIcon _icons="icofont icofont-life-ring" _label="" />
            </button>

            {isOpen && <BreathingExercise onClose={() => setIsOpen(false)} />}
        </>
    );
}
