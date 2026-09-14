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