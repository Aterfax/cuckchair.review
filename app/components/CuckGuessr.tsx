'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import GameMusic from './GameMusic';
import { FICTIONAL_ROUNDS, GameRound } from '../lib/cuckguessr';
import styles from './CuckGuessr.module.css';

type Phase = 'intro' | 'playing' | 'done';

interface RoundGuesses {
  location?: string | null;
  brand?: string | null;
}

function shuffle<T>(items: T[]): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

export default function CuckGuessr({ rounds = FICTIONAL_ROUNDS }: { rounds?: GameRound[] }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [deck, setDeck] = useState<GameRound[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [guesses, setGuesses] = useState<Record<string, RoundGuesses>>({});

  // Shuffle only in an effect so server and client markup stay identical.
  useEffect(() => {
    setDeck(shuffle(rounds));
  }, [rounds]);

  const round: GameRound | undefined = deck[index];
  const guessesFor = guesses[round?.id ?? ''] ?? {};
  const answeredLocation = guessesFor.location !== undefined;
  const answeredBrand = guessesFor.brand !== undefined;
  const reveal =
    phase === 'playing' && round && answeredLocation && (!round.brand || answeredBrand);

  const startGame = () => {
    setDeck(shuffle(rounds));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setGuesses({});
    setPhase('playing');
  };

  function answerLocation(option: string) {
    if (!round || answeredLocation) return;
    const correct = option === round.location;
    setGuesses((g) => ({ ...g, [round.id]: { ...g[round.id], location: option } }));
    if (correct) {
      setScore((s) => s + 10);
      setStreak((st) => {
        const next = st + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  }

  function answerBrand(option: string) {
    if (!round || answeredBrand) return;
    const correct = option === round.brand;
    setGuesses((g) => ({ ...g, [round.id]: { ...g[round.id], brand: option } }));
    if (correct) setScore((s) => s + 5);
  }

  function nextRound() {
    if (index + 1 < deck.length) {
      setIndex(index + 1);
    } else {
      setPhase('done');
    }
  }

  function answerClass(option: string, correct: string, answered?: string | null): string {
    if (answered === undefined) return styles.option;
    if (option === correct) return `${styles.option} ${styles.correct}`;
    if (option === answered) return `${styles.option} ${styles.wrong}`;
    return `${styles.option} ${styles.dim}`;
  }

  const locationResults = useMemo(() => deck.map((r) => guesses[r.id]?.location === r.location), [deck, guesses]);

  // Single GameMusic mount across all phases keeps the pre-armed player
  // alive between "Start the game" and the later "Play again" re-shuffles.
  let game: ReactElement;
  if (phase === 'intro' || deck.length === 0) {
    game = (
      <div className={styles.gamePanel}>
        <h2 className={styles.gameTitle}>Where in the world is this cuck chair?</h2>
        <p className={styles.gameIntro}>
          You get a viewing seat and nothing else. Study the scene, guess the
          location, and — where the venue is identifiable — the establishment
          too. +10 for each location, +5 per brand. Six rounds, one chair-eyed detective.
        </p>
        <ul className={styles.rules}>
          <li>Location guess: +10 points.</li>
          <li>Brand guess, when offered: +5 points.</li>
          <li>Mistakes break your streak. No prize but honour.</li>
        </ul>
        <button type="button" className={styles.nextBtn} onClick={startGame}>
          Start the game
        </button>
        <p className={styles.note}>
          Rounds mix locations staged from the review archive — real chairs,
          real venues and scores — with fictional placeholder scenes; archive
          rounds are labelled as such.
        </p>
      </div>
    );
  } else if (phase === 'done') {
    const maxScore = deck.length * 15;
    const locs = locationResults.filter(Boolean).length;
    game = (
      <div className={styles.gamePanel}>
        <h2 className={styles.gameTitle}>Game over</h2>
        <p className={styles.finalScore}>
          {score} / {maxScore} points
        </p>
        <p className={styles.gameIntro}>
          {locs} of {deck.length} locations nailed. Best streak: {bestStreak}.
          {score === maxScore
            ? ' Absolutely chair-voyant. '
            : locs >= deck.length - 2
              ? ' Nothing escaped the armchair detective. '
              : ' The road is long and the upholstery deeper. '}
          Replay to reshuffle the order.
        </p>
        <button type="button" className={styles.nextBtn} onClick={startGame}>
          Play again
        </button>
        <p className={styles.note}>
          Scenes mix review-archive locations with fictional placeholder material.
        </p>
      </div>
    );
  } else {
    game = (
    <div className={styles.gamePanel}>
      <div className={styles.toolbar}>
        <span className={styles.stat}>
          Round {index + 1}/{deck.length}
        </span>
        <span className={styles.stat}>Score {score}</span>
        <span className={styles.stat}>
          Streak {streak}
          {streak >= 2 ? ' 🔥' : ''}
        </span>
      </div>

      <img src={round!.image} alt={round!.alt} className={styles.stage} />

      {round!.fromArchive && (
        <span className={styles.archiveBadge}>From the review archive</span>
      )}

      <fieldset disabled={answeredLocation} className={styles.optionsField}>
        <legend className={styles.question}>Where in the world is this cuck chair?</legend>
        <div className={styles.options}>
          {round!.options.map((option) => (
            <button
              key={option}
              type="button"
              className={answerClass(option, round!.location, guessesFor.location)}
              onClick={() => answerLocation(option)}
              aria-pressed={option === guessesFor.location}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      {round!.brand && round!.brandOptions && (
        <fieldset disabled={answeredBrand} className={styles.optionsField}>
          <legend className={styles.question}>
            One for the detectives: which establishment is it?
          </legend>
          <div className={styles.options}>
            {round!.brandOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={answerClass(option, round!.brand!, guessesFor.brand)}
                onClick={() => answerBrand(option)}
                aria-pressed={option === guessesFor.brand}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {reveal && (
        <div className={styles.reveal} aria-live="polite">
          <p className={styles.revealLocation} style={{ color: guessesFor.location === round!.location ? '#34d399' : '#f87171' }}>
            {guessesFor.location === round!.location ? 'Correct: ' : 'Actually: '}
            {round!.location}
          </p>
          {round!.brand && (
            <p style={{ color: guessesFor.brand === round!.brand ? '#34d399' : '#f87171', marginBottom: 6 }}>
              Venue: {round!.brand}
              {guessesFor.brand === round!.brand ? ' — spotted' : ` (guessed: ${guessesFor.brand ?? 'nothing'})`}
            </p>
          )}
          {(round!.place || round!.mapUrl) && (
            <p className={styles.revealWhere}>
              Where: {round!.place ?? round!.location}
              {round!.mapUrl && (
                <>
                  {' '}·{' '}
                  <a
                    className={styles.revealMapLink}
                    href={round!.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </>
              )}
            </p>
          )}
          <p className={styles.revealFlavor}>{round!.flavor}</p>
          <button type="button" className={styles.nextBtn} onClick={nextRound}>
            {index + 1 < deck.length ? 'Next round' : 'See the verdict'}
          </button>
        </div>
      )}
      </div>
    );
  }

  return (
    <>
      <GameMusic requested={phase !== 'intro'} />
      {game}
    </>
  );
}
