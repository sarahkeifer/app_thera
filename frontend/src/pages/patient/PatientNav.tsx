/**
 * PatientNav
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Fixierte Bottom-Navigation für den Patienten-Bereich mit den fünf
 * Hauptbereichen (Home, Kalender, Stimmungsboard, Notizen, Lerninhalte).
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * Rein deklarativ: mappt jeden Navigationspunkt auf `NavLink` (aktiver
 * Zustand wird von react-router-dom automatisch per `.active`-Klasse
 * gesetzt).
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * react-router-dom (NavLink), @public-ui/react-v19 (KolIcon).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Die Navigation ist bewusst als eigenes `<nav>` mit `.footer-nav`-Styling
 * umgesetzt statt über eine KoliBri-Nav-Komponente (`kol-nav`), da
 * `kol-nav` primär für horizontale Kopfnavigationen mit Dropdowns gedacht
 * ist, während hier eine App-typische, fixierte Bottom-Tab-Bar mit Icon +
 * Kurzlabel benötigt wird. Semantisch bleibt die Navigation über das
 * native `<nav>`-Element korrekt ausgezeichnet; die Icons nutzen
 * konsequent `KolIcon`.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * `.footer-nav` ist fixiert am unteren Bildschirmrand, verteilt die
 * Einträge per `justify-content: space-around` gleichmäßig und bietet
 * durch großzügiges Padding (12px/14px) ausreichend große Touch-Flächen.
 * Seiteninhalte erhalten am unteren Rand entsprechendes Padding, damit sie
 * nicht von der fixierten Leiste verdeckt werden.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolIcon.
 */

import { NavLink } from "react-router-dom";
import { KolIcon } from "@public-ui/react-v19";

export default function PatientNav() {
    return (
        <nav className="footer-nav">
            <NavLink to="/patient/home">
                <KolIcon _icons="icofont icofont-home" _label="" />
                <span>Home</span>
            </NavLink>

            <NavLink to="/patient/calendar">
                <KolIcon _icons="icofont icofont-calendar" _label="" />
                <span>Kalender</span>
            </NavLink>

            <NavLink to="/patient/moodview">
                <KolIcon _icons="icofont icofont-simple-smile" _label="" />
                <span>Stimmungsboard</span>
            </NavLink>

            <NavLink to="/patient/notesview">
                <KolIcon _icons="icofont icofont-notepad" _label="" />
                <span>Notizen</span>
            </NavLink>

            <NavLink to="/patient/taskview">
                <KolIcon _icons="icofont icofont-book-alt" _label="" />
                <span>Lerninhalte</span>
            </NavLink>
        </nav>
    );
}
