import EventsList from '../../components/Event/EventList';
import { useNavigate } from 'react-router-dom';
import ROUTER_PATH from '../../navigation/path';
import { events } from '../../components/date/test-date';

function Func(){
    const navigate = useNavigate();
    return(
        <div>
            <EventsList handleMoreClick={() => {
                navigate(ROUTER_PATH.func);
              }}
              isVisibleSearth={true}
              eventList={events} />
        </div>
    )
}
export default Func;