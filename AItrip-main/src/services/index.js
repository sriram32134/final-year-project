import { DESTINATIONS_DATA } from '../data/destinations.js';
import { INITIAL_NOTIFICATIONS } from '../data/notifications.js';
import { TRAVELER_MEMORY } from '../data/memory.js';
import { submitTripReplan } from './locationResolverService.js';

// Load initial trips from localStorage or fallback to defaults
// Load saved user trips from localStorage or start empty
function loadSavedTrips() {
  try {
    const raw = localStorage.getItem('aitrip_user_trips');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Unable to load trips from localStorage:', e);
  }
  return [];
}

function persistTrips(updated) {
  try {
    localStorage.setItem('aitrip_user_trips', JSON.stringify(updated));
  } catch (e) {
    console.warn('Unable to persist trips to localStorage:', e);
  }
}

let trips = loadSavedTrips();
let notifications = [...INITIAL_NOTIFICATIONS];
let travelerMemory = { ...TRAVELER_MEMORY };

// ==========================================
// Destination Service
// ==========================================
export const destinationService = {
  async getAllDestinations() {
    return Promise.resolve([...DESTINATIONS_DATA]);
  },

  async getDestinationById(id) {
    const dest = DESTINATIONS_DATA.find((d) => d.id === id);
    return Promise.resolve(dest || null);
  },

  async searchDestinations(query, category = 'all') {
    const q = (query || '').toLowerCase().trim();
    return DESTINATIONS_DATA.filter((dest) => {
      const matchesQuery =
        !q ||
        dest?.name?.toLowerCase().includes(q) ||
        dest?.country?.toLowerCase().includes(q) ||
        (Array.isArray(dest?.tags) && dest.tags.some((t) => t?.toLowerCase().includes(q))) ||
        dest?.shortDescription?.toLowerCase().includes(q);

      const matchesCat =
        category === 'all' ||
        (dest?.category && dest.category.toLowerCase() === category.toLowerCase()) ||
        (dest?.travelStyle && dest.travelStyle.toLowerCase().includes(category.toLowerCase()));

      return matchesQuery && matchesCat;
    });
  },
};

// ==========================================
// Trip Service
// ==========================================
export const tripService = {
  async getAllTrips() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/trips');
      if (res.ok) {
        const remoteList = await res.json();
        if (Array.isArray(remoteList) && remoteList.length > 0) {
          const mappedRemote = remoteList.map((target) => {
            const destName = target.destination?.name || 'Destination';
            const destCountry = target.destination?.country || 'Global';
            return {
              id: target.tripId,
              title: `${destName} Multi-Agent Expedition`,
              destinationName: `${destName}, ${destCountry}`,
              coverImage: target.destination?.image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80',
              durationDays: target.durationDays || 4,
              travelers: target.travelers || 2,
              tripStyle: 'Bespoke Curated Travel',
              status: 'Confirmed',
              summary: target.summary || `Autonomous itinerary exploring ${destName}.`,
              budget: {
                total: target.estimatedBudget?.totalEstimated || 30000,
                breakdown: target.estimatedBudget || {},
              },
              weather: target.weatherOverview || {},
              transport: {
                mode: target.transportRecommendation?.primaryMode || 'Flight / Express Rail Corridor',
                transitTime: target.transportRecommendation?.transitTime || '1h 15m direct flight',
                flight: {
                  airline: target.transportRecommendation?.provider || 'Flight Demo Website (Playwright Automation)',
                  flightNumber: target.transportRecommendation?.flightNumber || '6E-532',
                  origin: target.origin?.name || 'Hyderabad',
                  destination: destName,
                  departureAirport: `${target.origin?.name || 'Hyderabad'} Gateway`,
                  arrivalAirport: `${destName} Terminal`,
                  departureTime: '06:00',
                  arrivalTime: '07:15',
                  duration: target.transportRecommendation?.transitTime || '1h 15m',
                  status: target.transportRecommendation?.bookingStatus || 'Confirmed (Automated)',
                  pnr: target.transportRecommendation?.bookingReference || target.transportRecommendation?.pnr || 'QP-HYDBLR-7499',
                  seat: '12A (Demo)',
                  terminal: 'T1',
                  gate: 'G-12',
                },
              },
              hotel: target.hotelRecommendation || {},
              days: target.itinerary || [],
              agentEvents: target.agentEvents || [],
            };
          });

          const localIds = new Set(trips.map((t) => t.id));
          return [...trips, ...mappedRemote.filter((t) => !localIds.has(t.id))];
        }
      }
    } catch (e) {
      console.warn('Unable to sync remote trips:', e);
    }
    return Promise.resolve([...trips]);
  },

  async getTripById(id) {
    if (!id) return null;
    let trip = trips.find((t) => t.id === id);
    if (!trip) {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/trips/${id}`);
        if (res.ok) {
          const remote = await res.json();
          const target = remote.trip || (remote.tripId ? remote : null);
          if (target) {
            const destName = target.destination?.name || 'Destination';
            const destCountry = target.destination?.country || 'Global';
            trip = {
              id: target.tripId || id,
              title: `${destName} Multi-Agent Expedition`,
              destinationName: `${destName}, ${destCountry}`,
              coverImage: target.destination?.image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80',
              durationDays: target.durationDays || 4,
              travelers: target.travelers || 2,
              tripStyle: 'Bespoke Curated Travel',
              status: 'Confirmed',
              summary: target.summary || `Autonomous itinerary exploring ${destName}.`,
              budget: {
                total: target.estimatedBudget?.totalEstimated || 30000,
                breakdown: target.estimatedBudget || {},
              },
              weather: target.weatherOverview || {},
              transport: {
                mode: target.transportRecommendation?.primaryMode || 'Flight / Express Rail Corridor',
                transitTime: target.transportRecommendation?.transitTime || '1h 15m direct flight',
                flight: {
                  airline: target.transportRecommendation?.provider || 'Flight Demo Website (Playwright Automation)',
                  flightNumber: target.transportRecommendation?.flightNumber || '6E-532',
                  origin: target.origin?.name || 'Hyderabad',
                  destination: destName,
                  departureAirport: `${target.origin?.name || 'Hyderabad'} Gateway`,
                  arrivalAirport: `${destName} Terminal`,
                  departureTime: '06:00',
                  arrivalTime: '07:15',
                  duration: target.transportRecommendation?.transitTime || '1h 15m',
                  status: target.transportRecommendation?.bookingStatus || 'Confirmed (Automated)',
                  pnr: target.transportRecommendation?.bookingReference || target.transportRecommendation?.pnr || 'QP-HYDBLR-7499',
                  seat: '12A (Demo)',
                  terminal: 'T1',
                  gate: 'G-12',
                },
              },
              hotel: target.hotelRecommendation || {},
              days: target.itinerary || [],
              agentEvents: target.agentEvents || [],
            };
            trips.unshift(trip);
            persistTrips(trips);
          }
        }
      } catch (e) {
        console.warn('Backend trip fetch fallback:', e);
      }
    }
    return trip || null;
  },

  async createTrip(tripData) {
    const newTrip = {
      ...tripData,
      id: tripData.id || `trip-${Date.now()}`,
      status: tripData.status || 'Confirmed',
    };
    trips = [newTrip, ...trips.filter((t) => t.id !== newTrip.id)];
    persistTrips(trips);
    return Promise.resolve(newTrip);
  },

  async updateTrip(id, updates) {
    trips = trips.map((t) => (t.id === id ? { ...t, ...updates } : t));
    persistTrips(trips);
    return Promise.resolve(trips.find((t) => t.id === id));
  },

  /**
   * Universal Dynamic Replanning:
   * Dispatches condition change (flight delay, weather storm, attraction closure, budget cut)
   * to the LangGraph AI multi-agent replanner and applies adaptations.
   */
  async applyReplan(tripId, conditionChange = 'Flight delayed by 3 hours', disruptionType = 'flight_delay') {
    const targetTrip = trips.find((t) => t.id === tripId) || trips[0];
    if (!targetTrip) return null;

    try {
      const replanResult = await submitTripReplan({
        tripId,
        conditionChange,
        disruptionType,
        severity: 'medium',
        currentTrip: targetTrip,
      });

      if (replanResult && replanResult.updatedItinerary) {
        trips = trips.map((t) => {
          if (t.id === tripId) {
            return {
              ...t,
              days: replanResult.updatedItinerary,
              replanHistory: [
                ...(t.replanHistory || []),
                {
                  timestamp: new Date().toISOString(),
                  condition: conditionChange,
                  summary: replanResult.replanSummary,
                  adaptations: replanResult.adaptationsApplied,
                },
              ],
            };
          }
          return t;
        });
        persistTrips(trips);
        return trips.find((t) => t.id === tripId);
      }
    } catch (err) {
      console.warn('Replan invocation failed, falling back to local shift:', err);
    }

    // Local resilient replan shift
    trips = trips.map((t) => {
      if (t.id === tripId) {
        const updatedDays = [...(t.days || [])];
        if (updatedDays[0]) {
          const day1 = { ...updatedDays[0] };
          day1.activities = (day1.activities || []).map((a, i) => {
            if (i === 0) {
              return {
                ...a,
                time: '14:30',
                title: `Adjusted Schedule: ${a.title}`,
                description: `${a.description} (Rescheduled due to: ${conditionChange})`,
              };
            }
            return a;
          });
          updatedDays[0] = day1;
        }
        return {
          ...t,
          days: updatedDays,
          replanHistory: [
            ...(t.replanHistory || []),
            {
              timestamp: new Date().toISOString(),
              condition: conditionChange,
              summary: `Schedule adapted for: ${conditionChange}`,
            },
          ],
        };
      }
      return t;
    });

    persistTrips(trips);
    return trips.find((t) => t.id === tripId);
  },
};

// ==========================================
// Notification Service
// ==========================================
export const notificationService = {
  async getNotifications() {
    return Promise.resolve([...notifications]);
  },

  async markAsRead(id) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return Promise.resolve([...notifications]);
  },

  async markAllAsRead() {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return Promise.resolve([...notifications]);
  },
};

// ==========================================
// Memory Service
// ==========================================
export const memoryService = {
  async getMemory() {
    return Promise.resolve({ ...travelerMemory });
  },

  async updatePreferences(updates) {
    travelerMemory = {
      ...travelerMemory,
      preferences: {
        ...travelerMemory.preferences,
        ...updates,
      },
    };
    return Promise.resolve({ ...travelerMemory });
  },
};

// ==========================================
// Execution Service (ICS Calendar & Print Export)
// ==========================================
export const executionService = {
  downloadICS(trip) {
    const calendarEvents = [];
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const days = trip.days || trip.itinerary || [];
    days.forEach((day) => {
      const activities = day.activities || [];
      activities.forEach((act) => {
        const dateStr = (day.date || '2026-10-15').replace(/[-:]/g, '');
        const [hh, mm] = (act.time || '09:00').split(':');
        const startDT = `${dateStr}T${hh || '09'}${mm || '00'}00`;
        const endHour = (parseInt(hh || '9', 10) + 2).toString().padStart(2, '0');
        const endDT = `${dateStr}T${endHour}${mm || '00'}00`;

        calendarEvents.push(`BEGIN:VEVENT
UID:${act.id}-${Date.now()}@aitrip.ai
DTSTAMP:${now}
DTSTART:${startDT}
DTEND:${endDT}
SUMMARY:${act.title}
DESCRIPTION:${(act.description || '').replace(/\n/g, ' ')}
LOCATION:${act.location || trip.destinationName || 'Destination'}
STATUS:CONFIRMED
END:VEVENT`);
      });
    });

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AITrip//Agentic AI Travel Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${trip.title}
${calendarEvents.join('\n')}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${trip.id}-itinerary.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  printItinerary() {
    window.print();
  },
};
