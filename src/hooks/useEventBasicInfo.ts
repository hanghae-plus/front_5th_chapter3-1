import { useState } from 'react';

import { Event } from '../types';

export const useEventBasicInfo = (initialEvent?: Event) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || '');

  const resetBasicInfo = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setLocation('');
    setCategory('');
  };

  const setBasicInfo = (event: Event) => {
    setTitle(event.title);
    setDate(event.date);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
  };

  return {
    title,
    setTitle,
    date,
    setDate,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    resetBasicInfo,
    setBasicInfo,
  };
};
