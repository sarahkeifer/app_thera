/**
 * HomeView (Patient)
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Startseite des Patienten-Bereichs. Begrüßt den Nutzer tageszeitabhängig
 * und bündelt die drei zentralen "Auf einen Blick"-Widgets: Stimmung
 * erfassen, offene Aufgaben und anstehende Termine.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * `greeting()` liefert abhängig von der aktuellen Uhrzeit eine passende
 * Anrede ("Guten Morgen"/"Guten Tag"/"Guten Abend").
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolHeading), HomeMoodCard, HomeTasksCard,
 * UpcomingAppointmentsCard.
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Die Seite selbst enthält bewusst keine Datenlade-Logik – jedes Widget
 * (Mood, Tasks, Appointments) lädt seine Daten eigenständig. Das hält die
 * Startseite unabhängig von der Reihenfolge/Verfügbarkeit einzelner
 * Backend-Endpunkte und macht die Widgets auf anderen Seiten
 * wiederverwendbar (siehe `UpcomingAppointmentsCard` auch in
 * `CalendarView`).
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Die Widgets sind als vertikal gestapelte `KolCard`-Blöcke umgesetzt, die
 * sich auf allen Bildschirmbreiten auf 100% der verfügbaren Container-
 * breite strecken (kein festes Grid nötig). Der äußere `.home-page`-Wrapper
 * bekommt `padding-bottom`, damit die fixe untere Navigation
 * (`.footer-nav`) den unteren Rand der Seite (zuletzt die Heatmap) nicht
 * verdeckt und bis zum Ende gescrollt werden kann.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolHeading (direkt); die eingebundenen Widgets nutzen weitere
 * KoliBri-Komponenten, siehe deren jeweilige Dokumentation.
 */

import HomeMoodCard from '../../components/HomeMoodCard';
import HomeTasksCard from '../../components/HomeTasksCard';
import TaskHeatmap from '../../components/TaskHeatmap';
import UpcomingAppointmentsCard from '../../components/UpcomingAppointmentsCard';
import  {KolHeading}  from "@public-ui/react-v19";
export default function HomeView() {

    const greeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) return 'Guten Morgen';
        if (hour < 18) return 'Guten Tag';

        return 'Guten Abend';
    };

    return (
        <div className="home-page">
            <div className="home-header">

                <KolHeading
                    _level={1}
                    _label={greeting()}
                />

                <p className="home-subtitle">
                    Wie geht es dir heute?
                </p>

            </div>

            <HomeMoodCard />

            <HomeTasksCard />

            {/* Gleiche "Kiste" wie unten auf patient/calendar: eigenständige
                Komponente, lädt ihre Termine selbst und bringt ihre eigenen
                Bearbeiten-/Löschen-Dialoge mit. */}
            <UpcomingAppointmentsCard />

            {/* GitHub-artige Aktivitäts-Heatmap: Aufgaben (grün) und
                Stimmungs-Einträge (orange) im selben Kästchen, siehe
                TaskHeatmap.tsx. */}
            <TaskHeatmap />
        </div>
    );

}