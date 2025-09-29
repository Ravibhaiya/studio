// src/components/screens/ExecutionScreen.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Mode, FractionAnswerType, ExecutionConfig, PowerType } from '@/lib/types';
import { useRipple } from '@/hooks/useRipple';
import {
  generateTablesQuestion,
  generatePracticeQuestion,
  generatePowersQuestion,
  generateFractionsQuestion,
} from '@/lib/question-helpers';
import { STAR_PATH } from '@/lib/constants';

interface ExecutionScreenProps {
  mode: Mode;
  config: ExecutionConfig;
}

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
  const createRipple = useRipple();

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
      questionData = generateTablesQuestion(
        config as { selected: number[] }
      );
    } else if (mode === 'practice') {
      questionData = generatePracticeQuestion(
        config as { digits1: number[]; digits2: number[] }
      );
    } else if (mode === 'powers') {
      questionData = generatePowersQuestion(
        config as { selected: PowerType[]; rangeMax: number }
      );
    } else if (mode === 'fractions') {
      questionData = generateFractionsQuestion(
        config as { selected: FractionAnswerType[] }
      );
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
      // Stricter validation for numeric input
      const sanitizedUserAnswer = userAnswerStr.replace(/,/g, '');
      const isValidNumber = /^-?\d*\.?\d+$/.test(sanitizedUserAnswer);

      if (isValidNumber) {
        const userAnswerNum = parseFloat(sanitizedUserAnswer);
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
      } else {
        isCorrect = false;
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
  

  return (
    <div
      id="execution-screen"
      className="screen active justify-start text-center pt-8 sm:px-6 md:px-8 lg:px-12"
    >
      <div className="w-full max-w-sm">
        {countdown !== null && activeTimerDuration && (
          <div className="relative w-32 h-32 mx-auto mb-4 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
            <svg className="w-full h-full animate-slow-spin" viewBox="-12 -12 294 297">
              <path
                d={STAR_PATH}
                fill="hsl(212, 93%, 96%)"
                strokeWidth="12"
                stroke={'hsl(212, 93%, 96%)'}
              />
              <path
                ref={timerPathRef}
                d={STAR_PATH}
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
