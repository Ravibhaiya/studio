// src/components/screens/ExecutionScreen.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Mode, PowerType } from '@/lib/types';
import { createRipple } from '@/lib/ui-helpers';

interface ExecutionScreenProps {
  mode: Mode;
}

const starPath =
  'M119.281 4.89431C129.006 -0.622275 140.913 -0.622272 150.637 4.89432L160.22 10.3306C164.883 12.9759 170.139 14.3984 175.5 14.4656L186.517 14.6036C197.641 14.7429 207.882 20.6903 213.516 30.2831L219.294 40.1207C221.984 44.6998 225.778 48.5317 230.33 51.2662L240.11 57.1411C249.553 62.8138 255.384 72.9732 255.519 83.9885L255.663 95.785C255.728 101.045 257.097 106.207 259.649 110.807L265.371 121.123C270.688 130.709 270.688 142.36 265.371 151.946L259.649 162.262C257.097 166.862 255.728 172.024 255.663 177.284L255.519 189.081C255.384 200.096 249.553 210.255 240.11 215.928L230.33 221.803C225.778 224.537 221.984 228.369 219.294 232.948L213.516 242.786C207.882 252.379 197.641 258.326 186.517 258.466L175.5 258.604C170.139 258.671 164.883 260.093 160.22 262.738L150.637 268.175C140.913 273.691 129.006 273.691 119.281 268.175L109.699 262.738C105.036 260.093 99.7794 258.671 94.4188 258.604L83.4018 258.466C72.2777 258.326 62.0367 252.379 56.4026 242.786L50.6247 232.948C47.9353 228.369 44.1411 224.537 39.5889 221.803L29.8092 215.928C20.3659 210.255 14.5349 200.096 14.4 189.081L14.2555 177.284C14.1911 172.024 12.8216 166.862 10.27 162.262L4.54823 151.946C-0.769008 142.36 -0.769008 130.709 4.54822 121.123L10.27 110.807C12.8216 106.207 14.1911 101.045 14.2555 95.785L14.4 83.9885C14.5349 72.9732 20.3659 62.8138 29.8092 57.1411L39.5889 51.2662C44.1411 48.5317 47.9353 44.6998 50.6247 40.1207L56.4026 30.2831C62.0367 20.6903 72.2777 14.7429 83.4018 14.6036L94.4188 14.4656C99.7794 14.3984 105.036 12.9759 109.699 10.3306L119.281 4.89431Z';

export default function ExecutionScreen({ mode }: ExecutionScreenProps) {
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const [countdown, setCountdown] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [pathLength, setPathLength] = useState(0);
  const timerPathRef = useRef<SVGPathElement>(null);

  const answerInputRef = useRef<HTMLInputElement>(null);

  const getQuestionSizeClass = () => {
    const len = question.replace(/<\/?[^>]+(>|$)/g, '').length;
    if (len >= 11) return 'display-small sm:display-medium';
    if (len >= 8) return 'display-medium sm:display-large';
    return 'display-large';
  };

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const timeUp = useCallback((answer: number) => {
      stopTimer();
      setIsAnswerRevealed(true);
      if (answerInputRef.current) answerInputRef.current.disabled = true;
      setFeedback(
        `<div class="flex items-center justify-center gap-2 text-red-600"><span class="material-symbols-outlined">timer</span><span class="body-large">Time's up! The answer is ${answer.toLocaleString()}</span></div>`
      );
    }, [stopTimer]);

  const displayQuestion = useCallback(() => {
    stopTimer();
    setIsAnswerRevealed(false);
    setFeedback('');
    if (answerInputRef.current) {
      answerInputRef.current.value = '';
      answerInputRef.current.disabled = false;
    }

    let questionString = '';
    let answer = 0;
    
    // Config is read from localStorage. This is a temporary solution.
    // In a larger app, this would be passed via props or context.
    const savedTimer = localStorage.getItem(`math_tools_timer_${mode}`);
    const activeTimer = savedTimer === 'null' ? undefined : Number(savedTimer);

    if (mode === 'tables') {
        const selectedTables = JSON.parse(localStorage.getItem('math_tools_selected_tables') || '[]');
        const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
        const multiplier = Math.floor(Math.random() * 10) + 1;
        answer = table * multiplier;
        questionString = `${table} &times; ${multiplier}`;
    } else if (mode === 'practice') {
        const selectedDigits1 = JSON.parse(localStorage.getItem('math_tools_selected_digits1') || '[]');
        const selectedDigits2 = JSON.parse(localStorage.getItem('math_tools_selected_digits2') || '[]');
        const d1 = selectedDigits1[Math.floor(Math.random() * selectedDigits1.length)];
        const d2 = selectedDigits2[Math.floor(Math.random() * selectedDigits2.length)];
        const generateRandomNumber = (digits: number) => {
            const min = Math.pow(10, digits - 1);
            const max = Math.pow(10, digits) - 1;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        const num1 = generateRandomNumber(d1);
        const num2 = generateRandomNumber(d2);
        answer = num1 * num2;
        questionString = `${num1} &times; ${num2}`;
    } else if (mode === 'powers') {
        const selectedPowers = JSON.parse(localStorage.getItem('math_tools_selected_powers') || '[]') as PowerType[];
        const powersRangeMax = parseInt(localStorage.getItem('math_tools_powers_range_max') || '30');
        const powerMode = selectedPowers[Math.floor(Math.random() * selectedPowers.length)];
        const minRange = 2;
        let maxNum = powersRangeMax;

        if (powerMode === 'cubes' || powerMode === 'cube_roots') {
            maxNum = Math.min(powersRangeMax, 20);
        }
         if (minRange > maxNum) {
             setQuestion("<span class='title-medium'>Invalid Range</span>");
             return;
         }

        const n = Math.floor(Math.random() * (maxNum - minRange + 1)) + minRange;

        switch (powerMode) {
            case 'squares':
                questionString = `${n}<sup>2</sup>`;
                answer = n * n;
                break;
            case 'cubes':
                questionString = `${n}<sup>3</sup>`;
                answer = n * n * n;
                break;
            case 'square_roots':
                questionString = `&radic;${(n * n).toLocaleString()}`;
                answer = n;
                break;
            case 'cube_roots':
                questionString = `<sup>3</sup>&radic;${(n * n * n).toLocaleString()}`;
                answer = n;
                break;
        }
    }

    setQuestion(questionString);
    setCurrentAnswer(answer);

    if (activeTimer && activeTimer > 0) {
      setCountdown(activeTimer);
      timerIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            timeUp(answer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(null);
    }

    setTimeout(() => answerInputRef.current?.focus(), 100);
  }, [mode, stopTimer, timeUp]);

  useEffect(() => {
    displayQuestion();
    return stopTimer;
    // displayQuestion is a dependency that can cause loops if not memoized correctly.
    // The useCallback hook for displayQuestion should have a stable dependency array.
  }, [displayQuestion, stopTimer]);


  useEffect(() => {
    if (timerPathRef.current) {
        // This effect runs only once to calculate the path length.
        setPathLength(timerPathRef.current.getTotalLength());
    }
  }, []);


  const checkAnswer = (event: React.FormEvent) => {
    event.preventDefault();
    stopTimer();
    if (isAnswerRevealed) {
      displayQuestion();
      return;
    }

    const userAnswer = parseInt(answerInputRef.current?.value || '', 10);
    if (isNaN(userAnswer)) return;

    if (userAnswer === currentAnswer) {
      setFeedback(
        `<div class="flex items-center justify-center gap-2 text-green-600"><span class="material-symbols-outlined">check_circle</span><span class="body-large">Correct!</span></div>`
      );
      setTimeout(displayQuestion, 1000);
    } else {
      setIsAnswerRevealed(true);
      if (answerInputRef.current) answerInputRef.current.disabled = true;
      setFeedback(
        `<div class="flex items-center justify-center gap-2 text-red-600"><span class="material-symbols-outlined">cancel</span><span class="body-large">The correct answer is ${currentAnswer.toLocaleString()}</span></div>`
      );
    }
  };

  const getActiveTimer = () => {
    if (typeof window !== 'undefined' && mode) {
        const savedTimer = localStorage.getItem(`math_tools_timer_${mode}`);
        return savedTimer === 'null' ? undefined : Number(savedTimer);
    }
    return undefined;
  }
  
  const activeTimerDuration = getActiveTimer();
  const timerProgress = countdown !== null && activeTimerDuration ? (countdown / activeTimerDuration) : 1;

  return (
    <div
      id="execution-screen"
      className="screen active justify-start text-center pt-8 sm:px-6 md:px-8 lg:px-12"
    >
      <div className="w-full max-w-sm">
        {countdown !== null && activeTimerDuration && (
          <div className="relative w-32 h-32 mx-auto mb-4 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
            <svg
              className="w-full h-full animate-slow-spin"
              viewBox="-12 -12 294 297"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <path
                d={starPath}
                fill="hsl(212, 93%, 96%)"
                strokeWidth="12"
                stroke={'hsl(212, 93%, 96%)'}
              />
              <path
                ref={timerPathRef}
                d={starPath}
                fill="none"
                strokeWidth="12"
                stroke="var(--md-sys-color-primary)"
                strokeLinecap="round"
                strokeDasharray={pathLength}
                strokeDashoffset={pathLength * (1 - timerProgress)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="headline-large sm:headline-large lg:display-small text-[var(--md-sys-color-on-surface-variant)]">
                {countdown}
              </span>
            </div>
          </div>
        )}
        <p
          id="question-text"
          className={`my-4 text-[var(--md-sys-color-on-surface)] flex justify-center items-center ${getQuestionSizeClass()}`}
          dangerouslySetInnerHTML={{ __html: question }}
        ></p>
        <form id="answer-form" className="mt-4" onSubmit={checkAnswer}>
          <div className="text-field">
            <input
              type="number"
              id="answer-input"
              placeholder=" "
              autoComplete="off"
              className="text-center title-large"
              ref={answerInputRef}
            />
            <label htmlFor="answer-input" className="body-large">
              Your Answer
            </label>
          </div>
          <button
            type="submit"
            className={`${
              isAnswerRevealed ? 'filled-button' : 'tonal-button'
            } ripple-surface w-full mt-6`}
            onMouseDown={createRipple}
          >
            <span className="label-large">
              {isAnswerRevealed ? 'Next' : 'Check'}
            </span>
          </button>
        </form>
        <div
          id="feedback-container"
          className="mt-6 min-h-[40px] sm:min-h-[48px]"
          dangerouslySetInnerHTML={{ __html: feedback }}
        ></div>
      </div>
    </div>
  );
}
