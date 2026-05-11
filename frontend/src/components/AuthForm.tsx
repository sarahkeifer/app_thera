import { useState } from "react";

type AuthFormProps = {
    onLoginSuccess: (role: string) => void;
};

function AuthForm({ onLoginSuccess }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("PATIENT");
    const [message, setMessage] = useState("");
    const [mode, setMode] = useState<"login" | "register">("login");

    function validateFields() {
        if (!email.trim()) {
            setMessage("Bitte E-Mail eingeben");
            return false;
        }

        if (!email.includes("@")) {
            setMessage("Bitte gültige E-Mail eingeben");
            return false;
        }

        if (!password.trim()) {
            setMessage("Bitte Passwort eingeben");
            return false;
        }

        return true;
    }

    async function register() {
        if (!validateFields()) return;

        const response = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, role }),
        });

        const text = await response.text();
        setMessage(text);
    }

    async function login() {
        if (!validateFields()) return;

        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const user = await response.json();

            onLoginSuccess(user.role);
            setMessage("Login erfolgreich");
        } else {
            setMessage("Login fehlgeschlagen");
        }
    }

    return (
        <div>
            <h1>{mode === "login" ? "Einloggen" : "Registrieren"}</h1>

            <input
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <br />

            <input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br />

            {mode === "register" && (
                <>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="PATIENT">Patient</option>
                        <option value="THERAPIST">Therapeut</option>
                    </select>

                    <br />
                </>
            )}

            {mode === "login" ? (
                <button onClick={login}>Einloggen</button>
            ) : (
                <button onClick={register}>Registrieren</button>
            )}

            <br />

            <p>{mode === "login" ? "Noch keinen Account?" : "Schon einen Account?"}</p>

            <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? "Registrieren" : "Einloggen"}
            </button>

            <p>{message}</p>
        </div>
    );
}

export default AuthForm;