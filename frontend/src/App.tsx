import {useState} from "react";
import AuthForm from "./components/AuthForm";
import "./App.css";
import {Navigate, Route, Routes} from "react-router-dom";
import HomeView from './pages/patient/HomeView'
import CalendarView from './pages/patient/CalendarView'
import MoodView from "./pages/patient/MoodView.tsx";
import NotesView from "./pages/patient/NotesView.tsx";
import TaskView from "./pages/patient/TaskView.tsx";
import PatientOverView from "./pages/therapist/PatientOverView.tsx";
import TaskPoolView from "./pages/therapist/TaskPoolView.tsx";
import PatientNav from "./pages/patient/PatientNav.tsx";
import TherapistNav from "./pages/therapist/TherapistNav.tsx";

function App() {
    const [loggedInRole, setLoggedInRole] = useState("");

    if (!loggedInRole) {
        return <AuthForm onLoginSuccess={setLoggedInRole}/>;
    }

    return (
        <>
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
                    <Route path="*" element={<Navigate to="/therapist/patientoverview" replace/>}/>
                </>}
            </Routes>
            {loggedInRole === "PATIENT" && <PatientNav/>}
            {loggedInRole === "THERAPIST" && <TherapistNav/>}


        </>
    );
}

export default App;


