import {NavLink} from "react-router-dom";

export default function TherapistNav() {
    return (
        <nav className="footer-nav">
            <NavLink to="/therapist/patientoverview">Patienten</NavLink>
            <NavLink to="/therapist/taskpoolview">Aufgaben-Pool</NavLink>
        </nav>
    );
}