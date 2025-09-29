// src/components/screens/ExecutionScreen.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Mode, PowerType, FractionAnswerType } from '@/lib/types';
import { createRipple } from '@/lib/ui-helpers';
import {
  generateTablesQuestion,
  generatePracticeQuestion,
  generatePowersQuestion,
  generateFractionsQuestion,
} from '@/lib/question-helpers';

interface ExecutionScreenProps {
  mode: Mode;
  config: any;
}

const starPath =
  'M119.281 4.89431C129.006 -0.622275 140.913 -0.622272 150.637 4.89432L160.22 10.3306C164.883 12.9759 170.139 14.3984 175.5 14.4656L186.517 14.6036C197.641 14.7429 207.882 20.6903 213.516 30.2831L219.294 40.1207C221.984 44.6998 225.778 48.5317 230.33 51.2662L240.11 57.1411C249.553 62.8138 255.384 72.9732 255.519 83.9885L255.663 95.785C255.728 101.045 257.097 106.207 259.649 110.807L265.371 121.123C270.688 130.709 270.688 142.36 265.371 151.946L259.649 162.262C257.097 166.862 255.728 172.024 255.663 177.284L255.519 189.081C255.384 200.096 249.553 210.255 240.11 215.928L230.33 221.803C225.778 224.537 221.984 228.369 219.294 232.948L213.516 242.786C207.882 252.379 197.641 258.326 186.517 258.466L175.5 258.604C170.139 258.671 164.883 260.093 160.22 262.738L150.637 268.175C140.913 273.691 129.006 273.691 119.281 268.175L109.699 262.738C105.036 260.093 99.7794 258.671 94.4188 258.604L83.4018 258.466C72.2777 258.326 62.0367 252.379 56.4026 242.786L50.6247 232.948C47.9353 228.369 44.1411 224.537 39.5889 221.803L29.8092 215.928C20.3659 210.255 14.5349 200.096 14.4 189.081L14.2555 177.284C14.1911 172.024 12.8216 166.862 10.27 162.262L4.54823 151.946C-0.769008 142.36 -0.769008 130.709 4.54822 121.123L10.27 110.807C12.8216 106.207 14.1911 101.045 14.2555 95.785L14.4 83.9885C14.5349 72.9732 20.3659 62.8138 29.8092 57.1411L39.5889 51.2662C44.1411 48.5317 47.9353 44.6998 50.6247 40.1207L56.4026 30.2831C62.0367 20.6903 72.2777 14.7429 83.4018 14.6036L94.4188 14.4656C99.7794 14.3984 105.036 12.9759 109.699 10.3306L119.281 4.89431Z';

export default function ExecutionScreen({ mode, config }: ExecutionScreenProps) {
  const [question, setQuestion] = useState('');
  const [answerTypeHint, setAnswerTypeHint] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<string | number>(0);
  const [unroundedAnswer, setUnroundedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const [countdown, setCountdown] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [pathLength, setPathLength] = useState(0);
  const timerPathRef = useRef<SVGPathElement>(null);
  const [activeAnswerType, setActiveAnswerType] =
    useState<FractionAnswerType | null>(null);

  const answerInputRef = useRef<HTMLInputElement>(null);

  const getQuestionSizeClass = () => {
    if (mode === 'fractions') {
      return 'display-small sm:display-medium';
    }
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

  const timeUp = useCallback(
    (answer: number | string) => {
      stopTimer();
      setIsAnswerRevealed(true);
      if (answerInputRef.current) answerInputRef.current.disabled = true;
      setFeedback(
        `<div class="flex items-center justify-center gap-2 text-red-600"><span class="material-symbols-outlined">timer</span><span class="body-large">Time's up! The answer is ${
          typeof answer === 'number' ? answer.toLocaleString() : answer
        }</span></div>`
      );
    },
    [stopTimer]
  );

  const displayQuestion = useCallback(() => {
    stopTimer();
    setIsAnswerRevealed(false);
    setFeedback('');
    setAnswerTypeHint('');
    setActiveAnswerType(null);
    setUnroundedAnswer(null);
    if (answerInputRef.current) {
      answerInputRef.current.value = '';
      answerInputRef.current.disabled = false;
    }

    let questionData;

    if (mode === 'tables') {
      questionData = generateTablesQuestion(config);
    } else if (mode === 'practice') {
      questionData = generatePracticeQuestion(config);
    } else if (mode === 'powers') {
      questionData = generatePowersQuestion(config);
    } else if (mode === 'fractions') {
      questionData = generateFractionsQuestion(config);
      setAnswerTypeHint(questionData.hint || '');
      setActiveAnswerType(questionData.answerType || null);
      if (questionData.unroundedAnswer) {
        setUnroundedAnswer(questionData.unroundedAnswer);
      }
    } else {
      // Should not happen
      setQuestion('Error');
      setCurrentAnswer(0);
      return;
    }

    if (!questionData) {
        setQuestion("<span class='title-medium'>Invalid Config</span>");
        return;
    }

    setQuestion(questionData.question);
    setCurrentAnswer(questionData.answer);

    const activeTimer = config.timer;
    if (activeTimer && activeTimer > 0) {
      setCountdown(activeTimer);
      timerIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            timeUp(questionData!.answer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(null);
    }

    setTimeout(() => answerInputRef.current?.focus(), 100);
  }, [mode, config, stopTimer, timeUp]);

  useEffect(() => {
    displayQuestion();
    return stopTimer;
  }, [displayQuestion, stopTimer]);

  useEffect(() => {
    if (timerPathRef.current) {
      setPathLength(timerPathRef.current.getTotalLength());
    }
  }, []);

  const checkAnswer = (event: React.FormEvent) => {
    event.preventDefault();
    const userAnswerStr = answerInputRef.current?.value.trim() || '';

    if (isAnswerRevealed) {
      displayQuestion();
      return;
    }

    if (userAnswerStr === '') {
      setFeedback(
        `<div class="flex items-center justify-center gap-2 text-yellow-600"><span class="material-symbols-outlined">warning</span><span class="body-large">Please enter an answer.</span></div>`
      );
      setTimeout(() => setFeedback(''), 2000);
      return;
    }

    stopTimer();

    let isCorrect = false;
    const isFractionPractice =
      mode === 'fractions' && activeAnswerType === 'fraction';

    if (isFractionPractice) {
      isCorrect =
        userAnswerStr.toLowerCase() ===
        currentAnswer.toString().toLowerCase();
    } else {
      const userAnswerNum = parseFloat(userAnswerStr.replace(/,/g, ''));
      if (!isNaN(userAnswerNum)) {
        if (unroundedAnswer !== null) {
          const tolerance = 0.01;
          isCorrect = Math.abs(userAnswerNum - unroundedAnswer) < tolerance;
        } else {
          const correctAnswerNum =
            typeof currentAnswer === 'string'
              ? parseFloat(currentAnswer.replace(/,/g, ''))
              : currentAnswer;
          isCorrect = userAnswerNum === correctAnswerNum;
        }
      }
    }

    if (isCorrect) {
      setFeedback(
        `<div class="flex items-center justify-center gap-2 text-green-600"><span class="material-symbols-outlined">check_circle</span><span class="body-large">Correct!</span></div>`
      );
      setTimeout(displayQuestion, 1000);
    } else {
      setIsAnswerRevealed(true);
      if (answerInputRef.current) answerInputRef.current.disabled = true;
      setFeedback(
        `<div class="flex items-center justify-center gap-2 text-red-600"><span class="material-symbols-outlined">cancel</span><span class="body-large">The correct answer is ${currentAnswer}</span></div>`
      );
    }
  };

  const activeTimerDuration = config.timer;
  const timerProgress =
    countdown !== null && activeTimerDuration
      ? countdown / activeTimerDuration
      : 1;

  const isNumericInput = !(
    mode === 'fractions' && activeAnswerType === 'fraction'
  );
  const showPercentAdornment =
    mode === 'fractions' && activeAnswerType === 'decimal';
  
  const timerAnimation = activeTimerDuration ? { animation: `slow-spin ${activeTimerDuration}s linear infinite` } : {};


  return (
    <div
      id="execution-screen"
      className="screen active justify-start text-center pt-8 sm:px-6 md:px-8 lg:px-12"
    >
      <div className="w-full max-w-sm">
        {countdown !== null && activeTimerDuration && (
          <div className="relative w-32 h-32 mx-auto mb-4 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
            <svg
              className="w-full h-full"
              viewBox="-12 -12 294 297"
              style={timerAnimation}
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
          className={`my-4 text-[var(--md-sys-color-on-surface)] flex justify-center items-center h-24 ${getQuestionSizeClass()}`}
          dangerouslySetInnerHTML={{ __html: question }}
        ></p>
        {answerTypeHint && (
          <p className="body-medium text-[var(--md-sys-color-on-surface-variant)] -mt-2 mb-4">
            {answerTypeHint}
          </p>
        )}
        <form id="answer-form" className="mt-4" onSubmit={checkAnswer}>
          <div className="text-field">
            <input
              type="text"
              inputMode={isNumericInput ? 'decimal' : 'text'}
              id="answer-input"
              placeholder=" "
              autoComplete="off"
              className={`text-center title-large ${
                showPercentAdornment ? '!pr-12' : ''
              }`}
              ref={answerInputRef}
            />
            <label htmlFor="answer-input" className="body-large">
              Your Answer
            </label>
            {showPercentAdornment && (
              <div
                id="percent-adornment"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 title-medium"
              >
                %
              </div>
            )}
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
