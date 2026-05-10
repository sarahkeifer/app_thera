import { useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PATIENT");
  const [message, setMessage] = useState("");
  const [loggedInRole, setLoggedInRole] = useState("");

  async function register() {
    const response = await fetch("http://localhost:8080/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    setMessage(response.ok ? "Registrierung erfolgreich" : "Registrierung fehlgeschlagen");
  }

    async function login() {
        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const user = await response.json();

            setLoggedInRole(user.role);
            setMessage("Login erfolgreich");
        } else {
            setMessage("Login fehlgeschlagen");
        }
    }

    if (loggedInRole === "PATIENT") {
        return <h1>Hallo Patient</h1>;
    }

    if (loggedInRole === "THERAPIST") {
        return <h1>Hallo Therapeut</h1>;
    }

  return (
      <div>
          <br/>
          <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
          />

          <br/>

          <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
          />

          <br/>

          <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="PATIENT">Patient</option>
              <option value="THERAPIST">Therapeut</option>
          </select>

          <br/>

          <button onClick={register}>Registrieren</button>
          <button onClick={login}>Einloggen</button>

          <p>{message}</p>
      </div>
  );
}

export default App;