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

export default function PsychoCard({ title, boxes, source  }: PsychoCardProps) {
    return (
        <div className="psycho-card">
            <h2 className="psycho-card-title">{title}</h2>

            <div className="psycho-box-grid">
                {boxes.map((box) => (
                    <div className="psycho-info-box" key={box.title}>
                        <h3>{box.title}</h3>

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
                    Quellen:  {source}
                </p>
            )}
        </div>
    );
}