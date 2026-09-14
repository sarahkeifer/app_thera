import HomeMoodCard from '../../components/HomeMoodCard';
import HomeTasksCard from '../../components/HomeTasksCard';
import  {KolHeading}  from "@public-ui/react-v19";
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

                <KolHeading
                    _level={1}
                    _label={greeting()}
                />

                <p className="home-subtitle">
                    Wie geht es dir heute?
                </p>

            </div>

            <HomeMoodCard />

            <HomeTasksCard />
        </>
    );

}
