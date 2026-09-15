/**
 * DetailDialog
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Generischer, wiederverwendbarer Overlay-Dialog für Detailansichten
 * (z. B. Aufgaben- oder Lerninhalt-Details). Kapselt lediglich das visuelle
 * Overlay + Card-Gerüst inkl. Schließen-Button; der eigentliche Inhalt wird
 * per `children` von außen eingespeist.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * Rendert ein Vollbild-Overlay mit zentrierter `KolCard`, die einen
 * Schließen-Button (`✕`) sowie beliebigen Kindinhalt enthält.
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolButton, KolCard).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * - Bewusst ohne eigenes State-Management: Sichtbarkeit wird vollständig
 *   vom aufrufenden Elternteil gesteuert (Mounten/Unmounten), damit die
 *   Komponente kontextunabhängig wiederverwendbar bleibt.
 * - Die Dialog-Hülle nutzt `KolCard` statt einer eigenen Box, da KoliBri für
 *   diesen Anwendungsfall bereits eine passende Komponente mit korrekter
 *   Rollen-/Fokus-Semantik bereitstellt.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * `.detail-dialog` begrenzt die Breite responsiv über
 * `min(640px, calc(100vw - 32px))` und erlaubt vertikales Scrollen
 * (`max-height: 85vh; overflow-y: auto`), damit auch auf kleinen
 * Bildschirmen kein horizontales Scrollen entsteht und lange Inhalte
 * erreichbar bleiben.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolButton, KolCard.
 */

import type { ReactNode } from "react";
import { KolButton, KolCard } from "@public-ui/react-v19";

type DetailDialogProps = {
    onClose: () => void;
    children: ReactNode;
};

export default function DetailDialog({ onClose, children }: DetailDialogProps) {
    return (
        <div className="home-mood-overlay">
            <div className="detail-dialog">
                <KolCard _label="" className="dialog">
                    <div className="detail-dialog-close">
                        <KolButton
                            _label="✕"
                            _hideLabel={false}
                            _variant="secondary"
                            _on={{ onClick: onClose }}
                        />
                    </div>

                    {children}
                </KolCard>
            </div>
        </div>
    );
}
