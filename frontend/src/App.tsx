/**
 * App
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Wurzelkomponente der Anwendung. Steuert das rollenbasierte Routing
 * (Patient vs. Therapeut) sowie den globalen Login-/Logout-Zustand. Solange
 * kein Login vorliegt, wird ausschließlich das Auth-Formular gerendert;
 * danach entscheidet `loggedInRole`, welcher Routen-Baum (Patient/Therapeut)
 * inklusive der passenden Bottom-Navigation angezeigt wird.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - Initialisiert den Login-Zustand aus `localStorage` (Persistenz über
 *   Seiten-Reloads hinweg), ohne einen eigenen Auth-Context einzuführen.
 * - `handleLogout()` räumt die gespeicherten Session-Daten auf und setzt
 *   die Anwendung zurück auf die Login-Ansicht.
 * - Definiert für jede Rolle einen eigenen `<Routes>`-Block inkl. Fallback-
 *   Route (`*`), die auf die jeweilige Startseite umleitet.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * react-router-dom (Routing), @public-ui/react-v19 (KolIcon für den
 * Logout-Button), lokale Seiten-/Komponenten-Module.
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * - Bewusst kein globaler State-Manager: Die Rolle ist der einzige global
 *   benötigte Zustand, `useState` + `localStorage` reichen dafür aus.
 * - Rollentrennung erfolgt rein über bedingtes Rendering der Routen-Blöcke,
 *   nicht über verschachtelte Router – hält die Struktur flach und
 *   nachvollziehbar.
 * - `PanicButton` wird ausschließlich für die Rolle PATIENT gerendert, und
 *   zwar außerhalb der `<Routes>` – damit ist er auf jeder Patienten-Unter-
 *   seite erreichbar, unabhängig vom aktuellen Routen-Ziel.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Der Logout-Button ist als fest positionierter, aber ausreichend großer
 * Touch-Button (≥ 40px) umgesetzt (siehe `.logout-btn` in App.css) und bleibt
 * auf allen Breakpoints erreichbar. Die eigentliche responsive Anpassung
 * erfolgt in den jeweiligen Seiten- und Nav-Komponenten.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolIcon (Logout-Icon).
 */

import {useState} from "react";
import AuthForm from "./components/AuthForm";
import "./App.css";
import {Navigate, Route, Routes} from "react-router-dom";
import {KolIcon} from "@public-ui/react-v19";
import HomeView from './pages/patient/HomeView'
import CalendarView from './pages/patient/CalendarView'
import MoodView from "./pages/patient/MoodView.tsx";
import NotesView from "./pages/patient/NotesView.tsx";
import TaskView from "./pages/patient/TaskView.tsx";
import PatientOverView from "./pages/therapist/PatientOverView.tsx";
import TaskPoolView from "./pages/therapist/TaskPoolView.tsx";
import ContentPoolView from "./pages/therapist/ContentPoolView.tsx";
import PatientNav from "./pages/patient/PatientNav.tsx";
import TherapistNav from "./pages/therapist/TherapistNav.tsx";
import PanicButton from "././components/PanicButton.tsx";

function App() {
    const [loggedInRole, setLoggedInRole] = useState(() => localStorage.getItem("role") || "");

    if (!loggedInRole) {
        return <AuthForm onLoginSuccess={setLoggedInRole}/>;
    }

    const handleLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        setLoggedInRole("");
    };

    return (
        <>
            <button className="logout-btn" onClick={handleLogout} aria-label="Ausloggen">
                <KolIcon _icons="icofont icofont-logout" _label="" />
            </button>

            <Routes>
                {/* Patient Routes */}
                {loggedInRole === "PATIENT" && <>
                    <Route path="/patient/home" element={<HomeView/>}/>
                    <Route path="/patient/calendar" element={<CalendarView/>}/>
                    <Route path="/patient/moodview" element={<MoodView/>}/>
                    <Route path="/patient/notesview" element={<NotesView/>}/>
                    <Route path="/patient/taskview" element={<TaskView/>}/>
                    <Route path="*" element={<Navigate to="/patient/home" replace/>}/>
                </>}
                {/* Therapist Routes */}
                {loggedInRole === "THERAPIST" && <>
                    <Route path="/therapist/patientoverview" element={<PatientOverView/>}/>
                    <Route path="/therapist/taskpoolview" element={<TaskPoolView/>}/>
                    <Route path="/therapist/contentpoolview" element={<ContentPoolView/>}/>
                    <Route path="*" element={<Navigate to="/therapist/patientoverview" replace/>}/>
                </>}
            </Routes>
            {loggedInRole === "PATIENT" && <PatientNav/>}
            {loggedInRole === "THERAPIST" && <TherapistNav/>}
            {loggedInRole === "PATIENT" && <PanicButton/>}


        </>
    );
}

export default App;


