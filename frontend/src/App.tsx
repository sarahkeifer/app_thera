import { useState } from "react";
import AuthForm from "./components/AuthForm";
import "./App.css";

function App() {
    const [loggedInRole, setLoggedInRole] = useState("");

    if (loggedInRole === "PATIENT") {
        return <h1>Hallo Patient</h1>;
    }

    if (loggedInRole === "THERAPIST") {
        return <h1>Hallo Therapeut</h1>;
    }

    return <AuthForm onLoginSuccess={setLoggedInRole} />;
}

export default App;