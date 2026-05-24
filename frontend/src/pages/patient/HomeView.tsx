import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

const moods = [
    { emoji: '🌞', label: 'Leicht', value: 5, color: 'bg-yellow-100 border-yellow-300' },
    { emoji: '🌿', label: 'Ruhig', value: 4, color: 'bg-green-100 border-green-300' },
    { emoji: '☁️', label: 'Neutral', value: 3, color: 'bg-slate-100 border-slate-300' },
    { emoji: '🌧️', label: 'Niedergeschlagen', value: 2, color: 'bg-blue-100 border-blue-300' },
    { emoji: '🌪️', label: 'Überfordert', value: 1, color: 'bg-purple-100 border-purple-300' },
];

export default function HomeView() {
    const navigate = useNavigate();
    const [pendingMood, setPendingMood] = useState<number | null>(null);
    const selectedMood = moods.find((m) => m.value === pendingMood);

    return (
        <>
            <div className="bg-white rounded-3xl p-6 mb-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    </div>
                    <h2 className="text-lg">Heutige Stimmung</h2>
                </div>

                <div className="flex gap-3 justify-around">
                    {moods.map((mood) => (
                        <button
                            key={mood.value}
                            onClick={() => setPendingMood(mood.value)}
                            className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center text-2xl"
                        >
                            {mood.emoji}
                        </button>
                    ))}
                </div>
            </div>

            {pendingMood && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-5 z-50">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-lg">
                        <div className="text-center mb-5">
                            <div className="text-5xl mb-3">{selectedMood?.emoji}</div>
                            <h2 className="text-lg mb-1">Stimmung tracken?</h2>
                            <p className="text-sm text-slate-600">
                                Möchtest du deine Stimmung als Eintrag speichern?
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPendingMood(null)}
                                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl font-medium"
                            >
                                Nein
                            </button>

                            <button
                                onClick={() => navigate('/patient/moodview')}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-medium"
                            >
                                Ja
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}