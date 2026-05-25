import HomeMoodCard from '../../components/HomeMoodCard';

export default function HomeView() {

    const greeting = () => {
        const hour = new Date().getHours();

        if (hour < 12) return 'Guten Morgen';
        if (hour < 18) return 'Guten Tag';

        return 'Guten Abend';
    };

    return (
        <>
            <div className="home-header">

                <h1 className="home-title">
                    {greeting()}
                </h1>

                <p className="home-subtitle">
                    Wie geht es dir heute?
                </p>

            </div>

            <HomeMoodCard />
        </>
    );

}