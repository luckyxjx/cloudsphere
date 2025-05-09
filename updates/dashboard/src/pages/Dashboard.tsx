import { 
  Activity, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Users, 
  Video
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Event {
  _id: string;
  title: string;
  time: string;
  duration: string;
}

function Dashboard() {
  // Sample data - would come from APIs in a real app
  const stats = [
    { label: 'Open Tasks', value: 12, icon: CheckCircle, color: 'bg-blue-500' },
    { label: 'Unread Messages', value: 24, icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'Team Members', value: 8, icon: Users, color: 'bg-green-500' },
    { label: 'Upcoming Calls', value: 3, icon: Video, color: 'bg-amber-500' },
  ];

  const recentActivities = [
    { id: 1, user: 'Jane Cooper', action: 'commented on task', item: 'Update landing page', time: '2 minutes ago' },
    { id: 2, user: 'Robert Fox', action: 'completed task', item: 'API Integration', time: '45 minutes ago' },
    { id: 3, user: 'Esther Howard', action: 'scheduled a call', item: 'Project Review', time: '1 hour ago' },
    { id: 4, user: 'Wade Warren', action: 'added a new task', item: 'Fix navigation bug', time: '3 hours ago' },
    { id: 5, user: 'Cameron Williamson', action: 'shared a document', item: 'Q3 Roadmap', time: 'Yesterday' },
  ];

  const sampleEvents = [
    { id: 1, title: 'Team Standup', time: '9:30 AM', duration: '30m' },
    { id: 2, title: 'Product Review', time: '11:00 AM', duration: '1h' },
    { id: 3, title: 'Client Meeting', time: '2:00 PM', duration: '45m' },
  ];

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', time: '', duration: '' });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/events');
      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async () => {
    try {
      // Format time to AM/PM format
      const timeValue = new Date(`2000/01/01 ${newEvent.time}`);
      const formattedTime = timeValue.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });

      const response = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newEvent,
          time: formattedTime
        }),
      });

      if (response.ok) {
        setIsEventModalOpen(false);
        setNewEvent({ title: '', time: '', duration: '' });
        fetchEvents(); // Refresh the events list
      }
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center space-x-4"
            >
              <div className={`${stat.color} rounded-lg p-3 text-white`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </h3>
            <button className="text-blue-500 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <p>
                    <span className="font-medium">{activity.user}</span>{' '}
                    <span className="text-gray-500 dark:text-gray-400">{activity.action}</span>{' '}
                    <span className="font-medium">{activity.item}</span>
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Upcoming Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
              Today's Schedule
            </h3>
            <button className="text-blue-500 text-sm">View Calendar</button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event._id}
                className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{event.duration}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {event.time}
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setIsEventModalOpen(true)}
            className="w-full mt-6 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            + Add New Event
          </button>
        </div>
      </div>

      {/* Add Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add New Event</h3>
            <input
              type="text"
              placeholder="Event Title"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <input
              type="time"
              className="w-full mb-3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
            <input
              type="text"
              placeholder="Duration (e.g., 30m, 1h)"
              className="w-full mb-4 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={newEvent.duration}
              onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;