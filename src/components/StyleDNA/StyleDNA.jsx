import { useEffect, useState } from 'react';
import { Button } from '../UI';
import { fetchStyleDna } from '../../utils/styleDnaApi';
import StyleProfile from './StyleProfile';
import StyleRecommendations from './StyleRecommendations';
import './StyleDNA.css';

export default function StyleDNA() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStyleDna().then(setData).catch((err) => setError(err.message || 'Could not load your Style DNA.'));
  }, []);

  if (error) return <p className="admin-error">{error}</p>;
  if (!data) return <p className="admin-loading">Reading your style…</p>;

  if (!data.hasSignal) {
    return (
      <div className="style-dna-page style-dna-page--empty">
        <p className="eyebrow">Your ZÉVON DNA</p>
        <h1 className="serif">Not Enough Signal Yet</h1>
        <p>
          Browse a few pieces, save something to your wishlist, or pick a mood — your Style DNA builds itself from
          what you actually respond to.
        </p>
        <Button to="/mood" variant="solid">
          Shop By Mood
        </Button>
      </div>
    );
  }

  return (
    <div className="style-dna-page">
      <p className="eyebrow">Your ZÉVON DNA</p>
      <h1 className="serif">Your Style, Read Back to You</h1>

      <StyleProfile moodProfile={data.moodProfile} signature={data.signature} />
      <StyleRecommendations recommendations={data.recommendations} stretchPick={data.stretchPick} />
    </div>
  );
}
