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
