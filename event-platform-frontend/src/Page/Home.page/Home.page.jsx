import Carousel from '../../components/carousel/carousel';
import { EventsList } from '../../components/Event/EventList';
import { events,} from '../../components/date/test-date';
import { useNavigate } from 'react-router-dom';
import ROUTER_PATH from '../../navigation/path';

function Home() {
    const navigate = useNavigate();
    return (
        <div className="bg-[#fef6f1]">
            <Carousel/>
            <EventsList eventList={events} isVisibleSearth={true}
                handleMoreClick={() => {
                    navigate(ROUTER_PATH.func);
                }} />
        </div>
    )
}
export default Home;