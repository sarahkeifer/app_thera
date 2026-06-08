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

            localStorage.setItem("userId", user.id);
            localStorage.setItem("role", user.role);

            onLoginSuccess(user.role);
            setMessage("Login erfolgreich");
        } else {
            setMessage("Login fehlgeschlagen");
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>{mode === "login" ? "Einloggen" : "Registrieren"}</h1>

                <input
                    className="auth-input"
                    type="email"
                    placeholder="E-Mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="auth-input"
                    type="password"
                    placeholder="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {mode === "register" && (
                    <div className="role-selector">
                        <button
                            className={role === "PATIENT" ? "active" : ""}
                            onClick={() => setRole("PATIENT")}
                        >
                            Patient
                        </button>

                        <button
                            className={role === "THERAPIST" ? "active" : ""}
                            onClick={() => setRole("THERAPIST")}
                        >
                            Therapeut
                        </button>
                    </div>
                )}

                <button className="auth-primary" onClick={mode === "login" ? login : register}>
                    {mode === "login" ? "Einloggen" : "Registrieren"}
                </button>

                <p className="auth-switch-text">
                    {mode === "login" ? "Noch keinen Account?" : "Schon einen Account?"}
                </p>

                <button className="auth-secondary" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                    {mode === "login" ? "Registrieren" : "Einloggen"}
                </button>

                {message && <p className="auth-message">{message}</p>}
            </div>
        </div>
    );
}

export default AuthForm;