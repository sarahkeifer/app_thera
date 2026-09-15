/**
 * PsychoCard
 * ============================================================================
 * Zweck & Verantwortlichkeit
 * ----------------------------------------------------------------------------
 * Stellt psychoedukative Lerninhalte (z. B. zu Krankheitsbildern oder
 * Therapieformen) strukturiert dar: Titel, mehrere Info-Boxen mit Fließtext
 * oder Aufzählungspunkten sowie optionale Quellenangabe.
 *
 * Zentrale Funktionen
 * ----------------------------------------------------------------------------
 * Rein präsentational: mappt die übergebenen `boxes` auf ein zweispaltiges
 * Rasterlayout und rendert je nach Box-Typ entweder Fließtext (`text`) oder
 * eine Aufzählungsliste (`points`).
 *
 * Abhängigkeiten
 * ----------------------------------------------------------------------------
 * @public-ui/react-v19 (KolHeading), lokale Bild-Assets
 * (meditation.jpg, herz.jpg).
 *
 * Design- & Architekturentscheidungen
 * ----------------------------------------------------------------------------
 * Die dekorativen Header-Bilder sind bewusst als normale `<img>`-Elemente
 * umgesetzt (kein KoliBri-Bildkomponenten-Äquivalent notwendig, da rein
 * dekorativ ohne Lade-/Fehlerzustände); für die Titelzeile wird konsequent
 * `KolHeading` verwendet.
 *
 * Responsive Design
 * ----------------------------------------------------------------------------
 * Der Info-Box-Bereich (`.psycho-box-grid`) nutzt ein zweispaltiges CSS-Grid,
 * das ab einer Breite von 700px auf eine Spalte umbricht. Der
 * Kartenkopf (`.psycho-card-header`) verwendet ab Tablet-Breite ebenfalls
 * ein flexibles, umbrechendes Layout statt fester Spaltenbreiten, damit
 * Titel und Bilder auf schmalen Displays nicht abgeschnitten werden.
 *
 * Verwendete KoliBri-Komponenten
 * ----------------------------------------------------------------------------
 * KolHeading.
 */

import meditationImage from "../assets/meditation.jpg";
import herzImage from "../assets/herz.jpg";
import {KolHeading} from "@public-ui/react-v19";

type InfoBox = {
    title: string;
    points?: string[];
    text?: string;
};

type PsychoCardProps = {
    title: string;
    boxes: InfoBox[];
    source?: string;
};

export default function PsychoCard({title, boxes, source}: PsychoCardProps) {
    return (
        <div className="psycho-card">

            <div className="psycho-card-header">

                <img
                    src={meditationImage as string}
                    alt="Meditation"
                    className="psycho-card-image"
                />

                <KolHeading
                    _level={2}
                    _label={title}
                    class="psycho-card-title"
                />

                <img
                    src={herzImage as string}
                    alt="Herz"
                    className="psycho-card-heart"
                />

            </div>


            <div className="psycho-box-grid">
                {boxes.map((box) => (
                    <div className="psycho-info-box" key={box.title}>
                        <KolHeading
                            _level={3}
                            _label={box.title}
                        />

                        {box.text && (
                            <p>{box.text}</p>
                        )}

                        {box.points && (
                            <ul>
                                {box.points.map((point) => (
                                    <li key={point}>{point}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            {source && (
                <p className="psycho-source">
                    Quelle(n): {source}
                </p>
            )}


        </div>
    );
}