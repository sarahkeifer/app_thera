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
