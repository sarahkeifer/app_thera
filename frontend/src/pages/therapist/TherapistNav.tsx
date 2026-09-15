/**
 * TherapistNav
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Fixierte Bottom-Navigation für den Therapeuten-Bereich mit den drei
 * Hauptbereichen (Patientenübersicht, Aufgaben-Pool, Lerninhalte-Pool).
 * Struktur und Begründung entsprechen `PatientNav` (siehe dortige
 * Dokumentation zur Wahl von `<nav>` statt `kol-nav`).
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolIcon.
 */

import { NavLink } from "react-router-dom";
import { KolIcon } from "@public-ui/react-v19";

export default function TherapistNav() {
    return (
        <nav className="footer-nav">
            <NavLink to="/therapist/patientoverview">
                <KolIcon _icons="icofont icofont-users-alt-3" _label="" />
                <span>Patienten</span>
            </NavLink>

            <NavLink to="/therapist/taskpoolview">
                <KolIcon _icons="icofont icofont-tasks-alt" _label="" />
                <span>Aufgaben-Pool</span>
            </NavLink>

            <NavLink to="/therapist/contentpoolview">
                <KolIcon _icons="icofont icofont-book-alt" _label="" />
                <span>Lerninhalte</span>
            </NavLink>
        </nav>
    );
}
