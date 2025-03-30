import Carousel from '../../components/carousel/carousel';
import { EventsList } from '../../components/Event/EventList';
import { events, events2 } from '../../components/date/test-date';

function Home(){
    return (
        <div>
            <Carousel/>
            <EventsList eventList={events} isVisibleSearth={true}/>
            <EventsList eventList={events2}/>
        </div>
    )
}
export default Home;