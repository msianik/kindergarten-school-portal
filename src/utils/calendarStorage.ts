import { useState, useEffect, useCallback } from 'react';
import { AcademicCalendarEvent } from '../types/school';
import { INITIAL_ACADEMIC_EVENTS } from '../data/mockData';

export const ACADEMIC_EVENTS_STORAGE_KEY = 'ananda_academic_calendar_events_v2';
export const ACADEMIC_EVENTS_UPDATED_EVENT = 'ananda-academic-events-updated';

/**
 * Retrieves the currently saved academic events from localStorage or returns defaults
 */
export function getStoredAcademicEvents(): AcademicCalendarEvent[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(ACADEMIC_EVENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored academic events:', e);
    }
  }
  return INITIAL_ACADEMIC_EVENTS;
}

/**
 * Saves academic events to localStorage and dispatches sync event for all components
 */
export function saveAcademicEvents(events: AcademicCalendarEvent[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACADEMIC_EVENTS_STORAGE_KEY, JSON.stringify(events));
      window.dispatchEvent(
        new CustomEvent(ACADEMIC_EVENTS_UPDATED_EVENT, {
          detail: { events },
        })
      );
    } catch (e) {
      console.error('Failed to save academic events:', e);
    }
  }
}

/**
 * Creates and prepends a new academic event
 */
export function createAcademicEvent(
  eventData: Omit<AcademicCalendarEvent, 'id'>
): AcademicCalendarEvent {
  const current = getStoredAcademicEvents();
  const newEvent: AcademicCalendarEvent = {
    ...eventData,
    id: `cal-event-${Date.now()}`,
  };
  const updated = [newEvent, ...current];
  saveAcademicEvents(updated);
  return newEvent;
}

/**
 * Updates an existing academic event by id
 */
export function updateAcademicEvent(updatedEvent: AcademicCalendarEvent): AcademicCalendarEvent[] {
  const current = getStoredAcademicEvents();
  const index = current.findIndex((e) => e.id === updatedEvent.id);
  let updatedList: AcademicCalendarEvent[];
  if (index !== -1) {
    updatedList = [...current];
    updatedList[index] = updatedEvent;
  } else {
    updatedList = [updatedEvent, ...current];
  }
  saveAcademicEvents(updatedList);
  return updatedList;
}

/**
 * Deletes an academic event by id
 */
export function deleteAcademicEvent(id: string): AcademicCalendarEvent[] {
  const current = getStoredAcademicEvents();
  const updatedList = current.filter((e) => e.id !== id);
  saveAcademicEvents(updatedList);
  return updatedList;
}

/**
 * Resets events back to the original initial seed data
 */
export function resetAcademicEventsToDefault(): AcademicCalendarEvent[] {
  saveAcademicEvents(INITIAL_ACADEMIC_EVENTS);
  return INITIAL_ACADEMIC_EVENTS;
}

/**
 * React hook for live synchronized academic events across all user roles and portals
 */
export function useAcademicEvents() {
  const [events, setEvents] = useState<AcademicCalendarEvent[]>(() => getStoredAcademicEvents());

  useEffect(() => {
    const handleSync = (e: any) => {
      const syncEvents = e.detail?.events || getStoredAcademicEvents();
      setEvents(syncEvents);
    };

    window.addEventListener(ACADEMIC_EVENTS_UPDATED_EVENT, handleSync);
    // Also listen for storage events from other browser tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === ACADEMIC_EVENTS_STORAGE_KEY && e.newValue) {
        try {
          setEvents(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(ACADEMIC_EVENTS_UPDATED_EVENT, handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const addEvent = useCallback((eventData: Omit<AcademicCalendarEvent, 'id'>) => {
    return createAcademicEvent(eventData);
  }, []);

  const editEvent = useCallback((updated: AcademicCalendarEvent) => {
    return updateAcademicEvent(updated);
  }, []);

  const removeEvent = useCallback((id: string) => {
    return deleteAcademicEvent(id);
  }, []);

  const resetAll = useCallback(() => {
    return resetAcademicEventsToDefault();
  }, []);

  return {
    events,
    addEvent,
    editEvent,
    removeEvent,
    resetAll,
  };
}
