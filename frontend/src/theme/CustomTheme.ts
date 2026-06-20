export const CustomTheme = (
    patch: (name: string, map: Record<string, string | undefined>) => string
) => {
    return patch('custom', {

        // hier ist unsere Styles/Theme Klasse in der wir unseren ganz persönlichen Look kreieren können
        // ─── Buttons ───────────────────────────────────────────────────────────

        'kol-button': `
            button {
                font-family: 'Jaldi', sans-serif;
                width: var(--button-width, 420px);
                min-height: 56px;
                border: none;
                border-radius: 18px;
                background: #a855f7;
                color: white;
                font-size: 20px;
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
                font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
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

        'kol-card': `
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
                font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
                font-weight: 500;
                color: #08060d;
                font-size: 56px;
                letter-spacing: -1.68px;
                margin: 32px 0;
            }

            h2 {
                font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
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

    });
};