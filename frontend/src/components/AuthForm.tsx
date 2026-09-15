/**
 * AuthForm
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Login-/Registrierungsformular. Zeigt zwei Tabs ("Einloggen" /
 * "Registrieren"), validiert die Eingaben clientseitig und kommuniziert mit
 * dem Backend (`/auth/login`, `/auth/register`). Bei erfolgreichem Login wird
 * die Rolle des Nutzers über `onLoginSuccess` an `App` zurückgemeldet.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * - `validateFields()`: einfache Pflichtfeld-/Format-Prüfung vor jedem
 *   Request (verhindert unnötige Backend-Aufrufe bei offensichtlich
 *   unvollständigen Eingaben).
 * - `login()` / `register()`: führen den jeweiligen Fetch-Request aus und
 *   zeigen das Ergebnis über `showMessage()` an.
 * - `showMessage()`: zeigt eine Toast-ähnliche Meldung und blendet sie nach
 *   3 Sekunden automatisch wieder aus (Timeout wird bei erneutem Aufruf
 *   zurückgesetzt, damit sich Meldungen nicht überschneiden).
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolButton, KolInputEmail, KolInputPassword).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * - Die Tabs ("Einloggen"/"Registrieren") sind bewusst als schlichte
 *   `<button>`-Elemente mit eigenem Klassennamen umgesetzt und NICHT über
 *   die KoliBri-Tabs-Komponente (`kol-tabs`), da `kol-tabs` für Inhalts-
 *   Panels konzipiert ist, während hier lediglich der Formularmodus
 *   umgeschaltet wird. Die Formularfelder selbst (Eingabe, Buttons) nutzen
 *   konsequent KoliBri-Komponenten.
 * - `_hideLabel` an den Eingabefeldern wird verwendet, da das Formular über
 *   Platzhaltertext ohne sichtbare Labels auskommt; das zugängliche Label
 *   bleibt für Screenreader über `_label` erhalten.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * `.auth-card` und `.auth-tabs` verwenden inzwischen eine responsive,
 * fluide Breite (`clamp()`/`min(...)`) statt fester Pixelwerte, sodass das
 * Formular auf Mobilgeräten nicht über den Viewport hinausragt. Auf kleinen
 * Bildschirmen rücken die Rollen-Buttons (`role-selector`) untereinander.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolInputEmail, KolInputPassword.
 */

import { useRef, useState } from "react";
import { KolButton, KolInputEmail, KolInputPassword } from "@public-ui/react-v19";

type AuthFormProps = {
    onLoginSuccess: (role: string) => void;
};

function AuthForm({ onLoginSuccess }: AuthFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("PATIENT");
    const [message, setMessage] = useState("");
    const [mode, setMode] = useState<"login" | "register">("login");
    const messageTimeoutRef = useRef<number | null>(null);


    function validateFields() {
        if (!email.trim()) {
            showMessage("Bitte E-Mail eingeben");
            return false;
        }

        if (!email.includes("@")) {
            showMessage("Bitte gültige E-Mail eingeben");
            return false;
        }

        if (!password.trim()) {
            showMessage("Bitte Passwort eingeben");
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
        showMessage(text);
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
            showMessage("Login erfolgreich");
        } else {
            showMessage("Login fehlgeschlagen");
        }
    }

    function showMessage(text: string) {
        setMessage(text);


        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }

        messageTimeoutRef.current = window.setTimeout(() => {
            setMessage("");
        }, 3000);
    }

    return (
        <div className="auth-page">
            <div className="auth-tabs">
                <button
                    className={mode === "login" ? "auth-tab active" : "auth-tab"}
                    onClick={() => setMode("login")}
                >
                    Einloggen
                </button>

                <button
                    className={mode === "register" ? "auth-tab active" : "auth-tab"}
                    onClick={() => setMode("register")}
                >
                    Registrieren
                </button>
            </div>
            <div className="auth-card">
                <h1>{mode === "login" ? "Einloggen" : "Registrieren"}</h1>

                <KolInputEmail
                    _label="E-Mail"
                    _hideLabel
                    _value={email}
                    _on={{onInput: (_e, v) => setEmail(String(v))}}
                />

                <KolInputPassword
                    _label="Passwort"
                    _hideLabel
                    _value={password}
                    _on={{onInput: (_e, v) => setPassword(String(v))}}
                />

                {mode === "register" && (
                    <div className="role-selector">
                        <KolButton
                            _label="Patient"
                            _variant={role === "PATIENT" ? "primary" : "secondary"}
                            _on={{onClick: () => setRole("PATIENT")}}
                        />
                        <KolButton
                            _label="Therapeut"
                            _variant={role === "THERAPIST" ? "primary" : "secondary"}
                            _on={{onClick: () => setRole("THERAPIST")}}
                        />
                    </div>
                )}

                <div className="auth-submit">
                    <KolButton
                        _label={mode === "login" ? "Einloggen" : "Registrieren"}
                        _on={{onClick: mode === "login" ? login : register}}
                    />
                </div>

                {message && <p className="auth-message">{message}</p>}
            </div>
        </div>
    );
}

export default AuthForm;