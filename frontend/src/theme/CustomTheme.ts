// IcoFont (https://icofont.com/) wird als Web-Font per @font-face geladen.
// WICHTIG: Ein globaler <link>-Tag in index.html reicht NICHT aus, da KoliBri
// seine Icons per Shadow DOM rendert (siehe kol-button-wc / kol-icon interner
// Aufbau) und externe <link>-Stylesheets Shadow Roots nicht durchdringen.
// Deshalb wird das benötigte CSS hier direkt über KoliBris eigenes
// Theme-Patch-System injiziert (Adopted Stylesheets), das auch verschachtelte
// Shadow Roots erreicht. Enthält nur die im Projekt tatsächlich verwendeten
// Icon-Glyphen (nicht das komplette 2100+ Icon-Set), um die Stylesheet-Größe
// gering zu halten. Bei Bedarf für weitere Icons einfach weitere
// ".icofont-<name>:before { content: "\\XXXX"; }"-Zeilen ergänzen (Codepoints
// unter https://unpkg.com/@icon/icofont@1.0.1-alpha.1/icofont.css nachschlagen).
const iconFontCss = `
    @font-face {
        font-family: "icofont";
        src: url('https://unpkg.com/@icon/icofont@1.0.1-alpha.1/icofont.eot');
        src: url('https://unpkg.com/@icon/icofont@1.0.1-alpha.1/icofont.eot?#iefix') format('eot'),
            url('https://unpkg.com/@icon/icofont@1.0.1-alpha.1/icofont.woff2') format('woff2'),
            url('https://unpkg.com/@icon/icofont@1.0.1-alpha.1/icofont.woff') format('woff'),
            url('https://unpkg.com/@icon/icofont@1.0.1-alpha.1/icofont.ttf') format('truetype'),
            url('https://unpkg.com/@icon/icofont@1.0.1-alpha.1/icofont.svg#icofont') format('svg');
    }

    .icofont {
        font-family: "icofont" !important;
        font-style: normal;
        font-weight: normal;
        speak: none;
        text-decoration: none;
        text-transform: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    /* Navigationsleisten (PatientNav / TherapistNav) */
    .icofont-home:before { content: "\\ef47"; }
    .icofont-calendar:before { content: "\\eecd"; }
    .icofont-notepad:before { content: "\\efab"; }
    .icofont-book-alt:before { content: "\\ead1"; }
    .icofont-users-alt-3:before { content: "\\ed08"; }
    .icofont-tasks-alt:before { content: "\\f006"; }

    /* Mood-Skala (MoodView / HomeMoodCard / PatientOverView) */
    .icofont-nerd-smile:before { content: "\\eafd"; }
    .icofont-wink-smile:before { content: "\\eb06"; }
    .icofont-laughing:before { content: "\\eafc"; }
    .icofont-simple-smile:before { content: "\\eb02"; }
    .icofont-slightly-smile:before { content: "\\eb03"; }
    .icofont-expressionless:before { content: "\\eafa"; }
    .icofont-sad:before { content: "\\eb01"; }

    /* Notizen (NotesView: Text- vs. Audio-Notiz) */
    .icofont-file-text:before { content: "\\eb2a"; }
    .icofont-mic:before { content: "\\ef95"; }
    .icofont-clock-time:before { content: "\\eedc"; }
    .icofont-ui-record:before { content: "\\ec7d"; }

    /* Panikbutton / Atemübung */
    .icofont-life-ring:before { content: "\\ef6a"; }
    .icofont-lungs:before { content: "\\ef83"; }
    .icofont-telephone:before { content: "\\f008"; }
`;

export const CustomTheme = (
    patch: (name: string, map: Record<string, string | undefined>) => string
) => {
    return patch('custom', {

        // hier ist unsere Styles/Theme Klasse in der wir unseren ganz persönlichen Look kreieren können
        // ─── Buttons ───────────────────────────────────────────────────────────

        'kol-button': `
            ${iconFontCss}

            button {
                font-family: 'Jaldi', sans-serif;
                width: var(--button-width, 420px);
                min-height: 56px;
                border: none;
                border-radius: 18px;
                background: #a855f7;
                color: white;
                font-size: var(--button-font-size, 20px);
                font-weight: 600;
                cursor: pointer;
                transition:
                    background 0.2s ease,
                    transform 0.15s ease,
                    box-shadow 0.2s ease;
            }

            button:hover {
                background: #9333ea;
            }

            button:active {
                transform: scale(0.98);
            }

            button:focus-visible {
                outline: 3px solid rgba(170, 59, 255, 0.25);
                outline-offset: 2px;
            }
            
            :host([_variant="secondary"]) button {
                background: #f3e8ff;
                color: #7e22ce;
                border: 1px solid #d8b4fe;
            }
        
            :host([_variant="secondary"]) button:hover {
                background: #e9d5ff;
            }
            :host(.filter-btn) button {
                width: 140px;
                min-height: 48px;
            }

            /* Notiz-Typ-Buttons (Textnotiz / Audio) in NotesView */
            :host(.note-type-btn) button {
                width: 100%;
                min-height: 64px;
            }
            :host(.calendar-date) button {
                background: white;
                color: #334155;
                border: 1px solid #e2e8f0;
                min-height: 44px;
                padding: 8px 0;
                border-radius: 12px;
            }
            :host(.calendar-date) button:hover:not(:disabled) {
                background: #f8fafc;
                border-color: #7e22ce;
            }
            :host(.calendar-date-booked) button,
            :host(.calendar-date-booked) button:hover:not(:disabled) {
                background: #f3e8ff;
                color: #6b21a8;
                border-color: #c084fc;
            }
            :host(.calendar-date-today) button,
            :host(.calendar-date-today) button:hover:not(:disabled) {
                background: #7e22ce;
                color: white;
                border-color: #7e22ce;
                font-weight: 700;
            }
            :host(.calendar-date-today.calendar-date-booked) button {
                outline: 2px solid #7e22ce;
                outline-offset: 2px;
            }
            :host(.calendar-date) button:focus-visible,
            :host(.calendar-arrow) button:focus-visible {
                outline: 3px solid #2563eb;
                outline-offset: 3px;
            }
            :host(.calendar-arrow) button {
                width: 44px;
                min-height: 44px;
                padding: 8px;
                background: transparent;
                color: #7e22ce;
                border: 0;
            }
            :host(.calendar-arrow) button:hover { background: #f3e8ff; }
            .calendar-arrow-left, .calendar-arrow-right { font-size: 28px; line-height: 1; }
            :host(.calendar-icon-action) button { width: 48px; min-height: 48px; padding: 10px; }
            .calendar-edit-icon, .calendar-delete-icon { font-size: 26px; line-height: 1; }
        `,

        'kol-single-select': `
            :host(.calendar-time-select) label { font-size: 22px; font-weight: 600; }
            :host(.calendar-time-select) .kol-input-container { margin-top: 16px; position: relative; }
            :host(.calendar-time-select) input {
                width: 100%; min-height: 52px; padding: 12px 16px;
                font-family: 'Jaldi', sans-serif; font-size: 22px;
                background: #faf5ff; color: #38234d;
                border: 1px solid #d8b4fe; border-radius: 14px;
            }
            :host(.calendar-time-select) input:focus-visible {
                outline: 3px solid #7e22ce; outline-offset: 3px;
            }
            :host(.calendar-time-select) .kol-custom-suggestions-options-group {
                top: 100%; bottom: auto; left: 0; right: 0;
                max-height: min(162px, 30dvh) !important;
                overflow-y: auto; overscroll-behavior: contain;
                background: white; color: #38234d; border: 1px solid #d8b4fe;
                border-radius: 12px; box-shadow: 0 8px 24px rgba(59, 27, 88, .14);
                z-index: 10;
            }
            :host(.calendar-time-select) .kol-custom-suggestions-option { padding: 10px 14px; font-size: 20px; }
            :host(.calendar-time-select) .kol-custom-suggestions-option:hover,
            :host(.calendar-time-select) .kol-custom-suggestions-option:focus { background: #f3e8ff; }
            :host(.calendar-time-select) .kol-custom-suggestions-toggle {
                position: absolute; right: 16px; top: 50%; transform: translateY(-50%); cursor: pointer;
            }
            :host(.calendar-time-select) .kol-custom-suggestions-toggle::before { content: '⌄'; font-size: 24px; }
        `,

        'kol-input-radio': `
            :host(.calendar-type-choice) fieldset {
                border: 1px solid #d8b4fe; border-radius: 18px;
                padding: 20px; background: #faf5ff; color: #38234d;
            }
            :host(.calendar-type-choice) legend { font-size: 20px; font-weight: 600; margin-bottom: 20px; }
            :host(.calendar-type-choice) .kol-form-field__input { padding-top: 20px; }
            :host(.calendar-type-choice) .kol-field-control {
                padding: 14px 18px; border: 1px solid #e9d5ff;
                border-radius: 12px; background: #f3e8ff; color: #582780;
                font-size: 20px; margin-bottom: 12px;
            }
            :host(.calendar-type-choice) .kol-field-control:has(input:checked) {
                background: #e9d5ff; border-color: #7e22ce;
            }
            :host(.calendar-type-choice) label { cursor: pointer; background: transparent; padding: 8px; }
            :host(.calendar-type-choice) input { accent-color: #7e22ce; }
            :host(.calendar-type-choice) input:focus-visible { outline: 3px solid #7e22ce; outline-offset: 3px; }
        `,

        // ─── Inputs ────────────────────────────────────────────────────────────

        'kol-input-email': `
            input {
                font-family: 'Jaldi', sans-serif;
                width: 100%;
                min-height: 56px;
                box-sizing: border-box;
                border: 1px solid #e2e8f0;
                border-radius: 18px;
                background: white;
                margin-bottom: 36px;
                color: #1e293b;
                padding: 0 18px;
                font-size: 20px;
                transition:
                    border-color 0.2s ease,
                    box-shadow 0.2s ease;
            }

            input:hover {
                border-color: #cbd5e1;
            }

            input:focus {
                border-color: #aa3bff;
                box-shadow: 0 0 0 4px rgba(170, 59, 255, 0.12);
                outline: none;
            }

            input::placeholder {
                color: #94a3b8;
            }
        `,

        'kol-input-password': `
            input {
                font-family: 'Jaldi', sans-serif;
                width: 100%;
                min-height: 56px;
                box-sizing: border-box;
                border: 1px solid #e2e8f0;
                border-radius: 18px;
                margin-bottom: 36px;
                background: white;
                color: #1e293b;
                padding: 0 18px;
                font-size: 20px;
                transition:
                    border-color 0.2s ease,
                    box-shadow 0.2s ease;
            }

            input:hover {
                border-color: #cbd5e1;
            }

            input:focus {
                border-color: #aa3bff;
                box-shadow: 0 0 0 4px rgba(170, 59, 255, 0.12);
                outline: none;
            }

            input::placeholder {
                color: #94a3b8;
            }
        `,

        'kol-input-text': `
            input {
                width: 100%;
                min-height: 56px;
                box-sizing: border-box;
                border: 1px solid #e2e8f0;
                border-radius: 18px;
                background: white;
                color: #1e293b;
                padding: 0 18px;
                font-size: 16px;
                transition:
                    border-color 0.2s ease,
                    box-shadow 0.2s ease;
            }

            input:hover {
                border-color: #cbd5e1;
            }

            input:focus {
                border-color: #aa3bff;
                box-shadow: 0 0 0 4px rgba(170, 59, 255, 0.12);
                outline: none;
            }

            input::placeholder {
                color: #94a3b8;
            }
        `,

        'kol-input-date': `
            input {
                font-family: 'Jaldi', sans-serif;
                width: 100%;
                min-height: 56px;
                box-sizing: border-box;
                border: 1px solid #e2e8f0;
                border-radius: 18px;
                background: white;
                color: #1e293b;
                padding: 0 18px;
                font-size: 16px;
                transition:
                    border-color 0.2s ease,
                    box-shadow 0.2s ease;
            }

            input:hover {
                border-color: #cbd5e1;
            }

            input:focus {
                border-color: #aa3bff;
                box-shadow: 0 0 0 4px rgba(170, 59, 255, 0.12);
                outline: none;
            }
        `,

        'kol-input-file': `
            .kol-input-container {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                min-height: 56px;
                box-sizing: border-box;
                border: 1px dashed #cbd5e1;
                border-radius: 18px;
                background: #f8fafc;
                padding: 8px 16px;
            }

            .kol-input-container__filename {
                font-family: 'Jaldi', sans-serif;
                font-size: 15px;
                color: #64748b;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .kol-input-container--is-dragover {
                border-color: #aa3bff;
                background: rgba(170, 59, 255, 0.06);
            }
        `,

        // ─── Textarea (mood-textarea) ───────────────────────────────────────────

        'kol-textarea': `
            textarea {
                width: 100%;
                box-sizing: border-box;
                border: 1px solid #cbd5e1;
                border-radius: 20px;
                padding: 16px;
                min-height: 120px;
                resize: none;
                font-size: 18px;
                font-family: 'Jaldi', sans-serif;
                color: #1e293b;
                background: white;
                transition:
                    border-color 0.2s ease,
                    box-shadow 0.2s ease;
            }

            textarea:hover {
                border-color: #aa3bff;
            }

            textarea:focus {
                border-color: #aa3bff;
                box-shadow: 0 0 0 4px rgba(170, 59, 255, 0.12);
                outline: none;
            }

            textarea::placeholder {
                color: #94a3b8;
            }
        `,

        // ─── Card (auth-card, mood-card, task-card) ────────────────────────────
        //
        // WICHTIG: Alle Varianten sind hier ABSICHTLICH doppelt definiert -
        // einmal als Attribut-Selektor (:host([_variant="..."])) und einmal
        // als Klassen-Selektor (:host(.klassenname)). Im Code wird teils
        // "_variant='dialog'" und teils "className='dialog'" verwendet -
        // damit unabhängig davon immer gestylt wird, greifen beide Selektoren
        // auf dieselben Regeln zu.

        'kol-card': `
            :host(.calendar-appointment-card) {
                background: #f3edf9;
                border-color: #ded0ee;
                color: #38234d;
            }
            :host(.calendar-booking-card) {
                background: #fff; border: 1px solid #e9d5ff;
                border-radius: 28px; padding: 28px;
                box-shadow: 0 24px 70px rgba(59, 27, 88, .18);
            }
            :host {
                display: block;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 32px;
                padding: 24px;
                box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
                box-sizing: border-box;
            }

            /* auth-card variant: wider, stronger shadow */
            :host([_variant="auth"]) {
                max-width: 650px;
                margin: 0 auto;
                box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
            }

            /* task-card variant */
            :host([_variant="task"]) {
                border-radius: 20px;
                padding: 20px;
                cursor: pointer;
                box-shadow:
                    rgba(0, 0, 0, 0.1) 0 10px 15px -3px,
                    rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
            }

            :host([_variant="task"]):hover {
                box-shadow:
                    rgba(0, 0, 0, 0.15) 0 12px 20px -3px,
                    rgba(0, 0, 0, 0.08) 0 6px 8px -2px;
            }

            /* psycho-card variant */
            :host([_variant="psycho"]) {
                background: #fffded;
                border-radius: 28px;
                padding: 24px;
            }

            :host([_variant="dialog"]),
            :host(.dialog) {
              background: white;
              border-radius: 32px;
              padding: 24px;
              width: 100%;
              max-width: 500px;
            }

            :host([_variant="history"]),
            :host(.history) {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 32px;
                padding: 24px;
                margin-top: 32px;
            }

            :host([_variant="history-item"]),
            :host(.history-item) {
                background: #f8fafc;
                border: none;
                border-radius: 24px;
                padding: 16px;
                margin-bottom: 14px;
                box-shadow: none;
            }

            .kol-card__header,
            .kol-headline--strong {
                font-weight: 400;
                font-size: 20px;
            }
            
            :host(.task-card) {
              cursor: pointer;
              transition:
                transform 0.2s ease,
                box-shadow 0.2s ease,
                border-color 0.2s ease;
            }
            
            :host(.task-card:hover) {
              transform: translateY(-4px) scale(1.01);
              border-color: #c084fc;
              box-shadow:
                rgba(168, 85, 247, 0.18) 0 16px 30px -8px,
                rgba(0, 0, 0, 0.08) 0 6px 12px -4px;
            }

            /* note-card: Notiz-Karte in NotesView, angelehnt an task-card */
            :host(.note-card) {
                border-radius: 24px;
                padding: 20px;
                cursor: pointer;
                transition:
                    box-shadow 0.2s ease,
                    border-color 0.2s ease;
            }

            :host(.note-card:hover) {
                border-color: #c084fc;
                box-shadow:
                    rgba(168, 85, 247, 0.14) 0 10px 20px -6px,
                    rgba(0, 0, 0, 0.06) 0 4px 8px -2px;
            }

            div.header {
                display: none; /* hide default KoliBri card header if unused */
            }
        `,

        // ─── Link / Nav ────────────────────────────────────────────────────────

        'kol-link': `
            a {
                color: #08060d;
                font-size: 16px;
                border-radius: 6px;
                background: rgba(244, 243, 236, 0.5);
                display: inline-flex;
                padding: 6px 12px;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                transition: box-shadow 0.3s;
            }

            a:hover {
                box-shadow:
                    rgba(0, 0, 0, 0.1) 0 10px 15px -3px,
                    rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
            }

            a:focus-visible {
                outline: 2px solid #aa3bff;
                outline-offset: 2px;
            }

            /* footer-nav link */
            :host([_variant="nav"]) a {
                font-size: 13px;
                color: #888;
                background: transparent;
                padding: 4px 8px;
                border-radius: 0;
                box-shadow: none;
            }

            :host([_variant="nav"][aria-current="page"]) a {
                color: #08060d;
                font-weight: 500;
                border-bottom: 1.5px solid #08060d;
            }
        `,

        // ─── Nav (footer-nav) ──────────────────────────────────────────────────

        'kol-nav': `
            nav {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                border-top: 1px solid #e5e5e5;
                display: flex;
                justify-content: space-around;
                padding: 12px 0 14px;
                z-index: 100;
            }

            a {
                font-size: 13px;
                color: #888;
                text-decoration: none;
                padding: 4px 8px;
            }

            a[aria-current="page"],
            a.active {
                color: #08060d;
                font-weight: 500;
                border-bottom: 1.5px solid #08060d;
            }
        `,

        // ─── Heading ───────────────────────────────────────────────────────────

        'kol-heading': `
            /* page titles */
            h1 {
                font-family: 'Jaldi', sans-serif;
                font-weight: 500;
                color: #08060d;
                font-size: 56px;
                letter-spacing: -1.68px;
                margin: 32px 0;
            }

            h2 {
                font-family: 'Jaldi', sans-serif;
                font-weight: 500;
                color: #08060d;
                font-size: 24px;
                line-height: 118%;
                letter-spacing: -0.24px;
                margin: 0 0 8px;
            }

            @media (max-width: 1024px) {
                h1 { font-size: 36px; margin: 20px 0; }
                h2 { font-size: 20px; }
            }
        `,

        // ─── Badge / Tag (mood-label) ───────────────────────────────────────────

        'kol-badge': `
            span {
                font-size: 14px;
                color: #475569;
                background: transparent;
            }
        `,

        // ─── Details / Accordion (psycho info boxes) ───────────────────────────

        'kol-details': `
            div {
                background: #f8cbd6;
                border-radius: 20px;
                padding: 18px;
                color: black;
                text-align: center;
                line-height: 1.8;
            }

            summary {
                font-weight: 600;
                color: #08060d;
                cursor: pointer;
                margin-bottom: 12px;
            }
        `,

        // ─── Alert / Error ─────────────────────────────────────────────────────

        'kol-alert': `
            :host {
                display: block;
            }

            div {
                color: #dc2626;
                font-size: 15px;
                margin-bottom: 16px;
                text-align: center;
            }
        `,

        // ─── Tooltip ───────────────────────────────────────────────────────────

        'kol-tooltip': `
            div {
                background: #08060d;
                color: white;
                border-radius: 8px;
                padding: 6px 12px;
                font-size: 14px;
            }
        `,

        // ─── Icon (eigenständige KolIcon-Verwendung, z.B. in Nav-Leisten) ───────

        'kol-icon': iconFontCss,

    });
};
