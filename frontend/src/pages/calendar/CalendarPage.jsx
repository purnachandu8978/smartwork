import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Clock, Plus, Video, MapPin, Users } from "lucide-react";
import { apiClient } from "../../lib/axios";
import LoadingScreen from "../../components/shared/LoadingScreen";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await apiClient.get("/calendar");
      setEvents(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const getDayEvents = (selectedDate) => {
    return events.filter((e) => {
      const start = new Date(e.startDate).toDateString();
      return start === selectedDate.toDateString();
    });
  };

  if (loading) return <LoadingScreen />;

  const dayEvents = getDayEvents(date);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Schedule events, meetings, and workspace activities</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Widget */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex justify-center">
          <Calendar
            onChange={setDate}
            value={date}
            className="border-none w-full bg-transparent text-gray-800 dark:text-white"
          />
        </div>

        {/* Selected date events list */}
        <div className="col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col gap-4">
          <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Events for {date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </h3>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] no-scrollbar">
            {dayEvents.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                No events scheduled for this day.
              </div>
            ) : (
              dayEvents.map((event) => (
                <div
                  key={event._id}
                  className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700 rounded-xl space-y-2 hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-gray-950 dark:text-white">{event.title}</h4>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                      {event.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium pt-2 border-t border-gray-100 dark:border-gray-700/50">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {event.location?.type === "online" ? (
                      <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <Video className="w-3.5 h-3.5" /> Online Meeting
                      </span>
                    ) : event.location?.link ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {event.location.link}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {event.attendees?.length || 0} attending
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
