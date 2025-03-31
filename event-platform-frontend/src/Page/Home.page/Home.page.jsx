import Carousel from '../../components/carousel/carousel';
import { EventsList } from '../../components/Event/EventList';
import { events, events2 } from '../../components/date/test-date';
import { useNavigate } from 'react-router-dom';
import ROUTER_PATH from '../../navigation/path';

function Home() {
    const navigate = useNavigate();
    return (
        <div>
            <Carousel />
            <EventsList eventList={events} isVisibleSearth={true}
                handleMoreClick={() => {
                    navigate(ROUTER_PATH.func);
                }} />
            <EventsList eventList={events2}
                handleMoreClick={() => {
                    navigate(ROUTER_PATH.func);
                }} />
        </div>
    )
}
export default Home;