import { useState } from 'react';
import MoodSelector from '../components/MoodShop/MoodSelector';
import MoodExperience from '../components/MoodShop/MoodExperience';
import { recordMoodSelection } from '../utils/interactionsApi';
import '../components/MoodShop/MoodShop.css';

export default function MoodShopPage() {
  const [mood, setMood] = useState(null);

  const handleSelect = (selected) => {
    setMood(selected);
    recordMoodSelection(selected.tag).catch(() => {});
  };

  return mood ? (
    <MoodExperience mood={mood} onChangeMood={() => setMood(null)} />
  ) : (
    <MoodSelector onSelect={handleSelect} />
  );
}
