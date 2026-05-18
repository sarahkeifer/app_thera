import {NavLink} from "react-router-dom";

export default function PatientNav(){
return (
    <nav className="footer-nav">
        <NavLink to="/patient/home">Home</NavLink>
        <NavLink to="/patient/calendar">Kalender</NavLink>
        <NavLink to="/patient/moodview">Stimmungsboard</NavLink>
        <NavLink to="/patient/notesview">Notizen</NavLink>
        <NavLink to="/patient/taskview">Lerninhalte</NavLink>
    </nav>
);
}


