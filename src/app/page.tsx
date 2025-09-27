'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// Define types for state
type Page = 'home' | 'table-selection' | 'practice-config' | 'powers-config' | 'execution';
type Mode = '' | 'tables' | 'practice' | 'powers';
type PowerType = 'squares' | 'cubes' | 'square_roots' | 'cube_roots';

const TIMER_KEY_PREFIX = 'math_tools_timer_';

export default function Home() {
    const [page, setPage] = useState<Page>('home');
    const [mode, setMode] = useState<Mode>('');
    
    // Config states
    const [selectedTables, setSelectedTables] = useState<number[]>([]);
    const [selectedDigits1, setSelectedDigits1] = useState<number[]>([]);
    const [selectedDigits2, setSelectedDigits2] = useState<number[]>([]);
    const [selectedPowers, setSelectedPowers] = useState<PowerType[]>([]);
    const [powersRangeMax, setPowersRangeMax] = useState(30);
    const [tablesTimer, setTablesTimer] = useState<number | undefined>(10);
    const [practiceTimer, setPracticeTimer] = useState<number | undefined>(10);
    const [powersTimer, setPowersTimer] = useState<number | undefined>(10);


    // Execution state
    const [currentAnswer, setCurrentAnswer] = useState(0);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
    const [question, setQuestion] = useState('');
    const [feedback, setFeedback] = useState('');
    const [configError, setConfigError] = useState('');
    const [countdown, setCountdown] = useState<number | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const answerInputRef = useRef<HTMLInputElement>(null);
    const sliderRef = useRef<HTMLInputElement>(null);
    const sliderLabelRef = useRef<HTMLSpanElement>(null);
    const timerPathRef = useRef<SVGPathElement>(null);

    // Load timers from localStorage on initial render
    useEffect(() => {
        const loadTimer = (mode: Mode) => {
            const savedTimer = localStorage.getItem(`${TIMER_KEY_PREFIX}${mode}`);
            if (savedTimer !== null) {
                const timerValue = savedTimer === 'null' ? undefined : parseInt(savedTimer, 10);
                switch(mode) {
                    case 'tables': setTablesTimer(timerValue); break;
                    case 'practice': setPracticeTimer(timerValue); break;
                    case 'powers': setPowersTimer(timerValue); break;
                }
            }
        };
        loadTimer('tables');
        loadTimer('practice');
        loadTimer('powers');
    }, []);

    const pageTitles: Record<Page, string> = {
        'home': 'Math Tools',
        'table-selection': 'Multiplication Tables',
        'practice-config': 'Multiplication Practice',
        'powers-config': 'Powers & Roots',
        'execution': 'Practice'
    };

    const createRipple = (event: React.MouseEvent<HTMLElement>) => {
        const surface = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(surface.clientWidth, surface.clientHeight);
        const radius = diameter / 2;
        circle.style.width = circle.style.height = `${diameter}px`;
        const rect = surface.getBoundingClientRect();
        circle.style.left = `${event.clientX - (rect.left + radius)}px`;
        circle.style.top = `${event.clientY - (rect.top + radius)}px`;
        circle.classList.add("ripple");
        const oldRipple = surface.getElementsByClassName("ripple")[0];
        if (oldRipple) oldRipple.remove();
        surface.appendChild(circle);
    };

    const handleBack = () => {
        setFeedback('');
        setConfigError('');
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setCountdown(null);

        if (['table-selection', 'practice-config', 'powers-config'].includes(page)) {
            setPage('home');
        } else if (page === 'execution') {
            const prevPage = mode === 'tables' ? 'table-selection' : mode === 'practice' ? 'practice-config' : 'powers-config';
            setPage(prevPage);
        }
    };
    
    const handleStartClick = (execMode: Mode) => {
        let isValid = false;
        let errorMsg = '';

        switch(execMode) {
            case 'tables':
                isValid = selectedTables.length > 0;
                if (!isValid) errorMsg = 'Please select at least one multiplication table to practice.';
                break;
            case 'practice':
                isValid = selectedDigits1.length > 0 && selectedDigits2.length > 0;
                if (!isValid) errorMsg = 'Please select the number of digits for both numbers.';
                break;
            case 'powers':
                isValid = selectedPowers.length > 0;
                if (!isValid) errorMsg = 'Please select at least one practice type (e.g., Squares, Cubes).';
                break;
        }

        if (isValid) {
            setConfigError('');
            setMode(execMode);
            setPage('execution');
        } else {
            setConfigError(errorMsg);
        }
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
        if(answerInputRef.current) answerInputRef.current.disabled = true;
        setFeedback(`<div class="flex items-center justify-center gap-2 text-red-600"><span class="material-symbols-outlined">timer</span><span class="body-large">Time's up! The answer is ${answer.toLocaleString()}</span></div>`);

    }, [stopTimer]);


    const displayQuestion = useCallback(() => {
        stopTimer();
        setIsAnswerRevealed(false);
        setFeedback('');
        if(answerInputRef.current) {
            answerInputRef.current.value = '';
            answerInputRef.current.disabled = false;
        }

        let questionString = '';
        let answer = 0;
        let activeTimer: number | undefined;

        if (mode === 'tables') {
            const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
            const multiplier = Math.floor(Math.random() * 10) + 1;
            answer = table * multiplier;
            questionString = `${table} &times; ${multiplier}`;
            activeTimer = tablesTimer;
        } else if (mode === 'practice') {
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
            activeTimer = practiceTimer;
        } else if (mode === 'powers') {
            const powerMode = selectedPowers[Math.floor(Math.random() * selectedPowers.length)];
            const minRange = 2;
            let maxNum = powersRangeMax;
            activeTimer = powersTimer;

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
                setCountdown(prev => {
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

    }, [mode, selectedTables, selectedDigits1, selectedDigits2, selectedPowers, powersRangeMax, tablesTimer, practiceTimer, powersTimer, stopTimer, timeUp]);

    useEffect(() => {
        if (page === 'execution') {
            displayQuestion();
        }
        return stopTimer;
    }, [page, displayQuestion, stopTimer]);


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
            setFeedback(`<div class="flex items-center justify-center gap-2 text-green-600"><span class="material-symbols-outlined">check_circle</span><span class="body-large">Correct!</span></div>`);
            setTimeout(displayQuestion, 1000);
        } else {
            setIsAnswerRevealed(true);
            if(answerInputRef.current) answerInputRef.current.disabled = true;
            setFeedback(`<div class="flex items-center justify-center gap-2 text-red-600"><span class="material-symbols-outlined">cancel</span><span class="body-large">The correct answer is ${currentAnswer.toLocaleString()}</span></div>`);
        }
    };

    const handleSelectionChange = () => {
        if (configError) {
            setConfigError('');
        }
    };

    const handleTableSelection = (table: number) => {
        setSelectedTables(prev => 
            prev.includes(table) ? prev.filter(n => n !== table) : [...prev, table]
        );
        handleSelectionChange();
    };

    const handleDigitSelection = (group: 'digits1' | 'digits2', digit: number) => {
        const setter = group === 'digits1' ? setSelectedDigits1 : setSelectedDigits2;
        setter(prev => 
            prev.includes(digit) ? prev.filter(d => d !== digit) : [...prev, digit]
        );
        handleSelectionChange();
    };

    const handlePowerSelection = (powerType: PowerType) => {
        setSelectedPowers(prev =>
            prev.includes(powerType) ? prev.filter(p => p !== powerType) : [...prev, powerType]
        );
        handleSelectionChange();
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setPowersRangeMax(value);
    };

    const handleTimerChange = (mode: Mode, value: string) => {
        const timerValue = value === '' || parseInt(value, 10) === 0 ? undefined : parseInt(value, 10);
        const storageValue = timerValue === undefined ? 'null' : timerValue.toString();
        
        switch(mode) {
            case 'tables':
                setTablesTimer(timerValue);
                localStorage.setItem(`${TIMER_KEY_PREFIX}tables`, storageValue);
                break;
            case 'practice':
                setPracticeTimer(timerValue);
                localStorage.setItem(`${TIMER_KEY_PREFIX}practice`, storageValue);
                break;
            case 'powers':
                setPowersTimer(timerValue);
                localStorage.setItem(`${TIMER_KEY_PREFIX}powers`, storageValue);
                break;
        }
    };
    
    useEffect(() => {
        if(sliderRef.current && sliderLabelRef.current) {
            const slider = sliderRef.current;
            const valueLabel = sliderLabelRef.current;
            const min = parseInt(slider.min);
            const max = parseInt(slider.max);
            const value = parseInt(slider.value);
            const percent = ((value - min) / (max - min)) * 100;
            const thumbWidth = 20;
            valueLabel.style.left = `calc(${percent}% + (${(thumbWidth / 2) - (percent / 100 * thumbWidth)}px))`;
        }
    }, [powersRangeMax]);

    const hasCubeSelection = selectedPowers.includes('cubes') || selectedPowers.includes('cube_roots');
    const isPowerRangeAbove20 = powersRangeMax > 20;
    
    const getQuestionSizeClass = () => {
        const len = question.replace(/<\/?[^>]+(>|$)/g, "").length;
        if (len >= 11) return 'display-small sm:display-medium';
        if (len >= 8) return 'display-medium sm:display-large';
        return 'display-large';
    };

    const navigateTo = (targetPage: Page) => {
        setConfigError('');
        setPage(targetPage);
    };

    const getActiveTimer = () => {
        switch(mode) {
            case 'tables': return tablesTimer;
            case 'practice': return practiceTimer;
            case 'powers': return powersTimer;
            default: return null;
        }
    }
    
    const activeTimerDuration = getActiveTimer();
    const timerProgress = countdown !== null && activeTimerDuration ? (countdown / activeTimerDuration) : 1;
    
    const starPath = "M119.281 4.89431C129.006 -0.622275 140.913 -0.622272 150.637 4.89432L160.22 10.3306C164.883 12.9759 170.139 14.3984 175.5 14.4656L186.517 14.6036C197.641 14.7429 207.882 20.6903 213.516 30.2831L219.294 40.1207C221.984 44.6998 225.778 48.5317 230.33 51.2662L240.11 57.1411C249.553 62.8138 255.384 72.9732 255.519 83.9885L255.663 95.785C255.728 101.045 257.097 106.207 259.649 110.807L265.371 121.123C270.688 130.709 270.688 142.36 265.371 151.946L259.649 162.262C257.097 166.862 255.728 172.024 255.663 177.284L255.519 189.081C255.384 200.096 249.553 210.255 240.11 215.928L230.33 221.803C225.778 224.537 221.984 228.369 219.294 232.948L213.516 242.786C207.882 252.379 197.641 258.326 186.517 258.466L175.5 258.604C170.139 258.671 164.883 260.093 160.22 262.738L150.637 268.175C140.913 273.691 129.006 273.691 119.281 268.175L109.699 262.738C105.036 260.093 99.7794 258.671 94.4188 258.604L83.4018 258.466C72.2777 258.326 62.0367 252.379 56.4026 242.786L50.6247 232.948C47.9353 228.369 44.1411 224.537 39.5889 221.803L29.8092 215.928C20.3659 210.255 14.5349 200.096 14.4 189.081L14.2555 177.284C14.1911 172.024 12.8216 166.862 10.27 162.262L4.54823 151.946C-0.769008 142.36 -0.769008 130.709 4.54822 121.123L10.27 110.807C12.8216 106.207 14.1911 101.045 14.2555 95.785L14.4 83.9885C14.5349 72.9732 20.3659 62.8138 29.8092 57.1411L39.5889 51.2662C44.1411 48.5317 47.9353 44.6998 50.6247 40.1207L56.4026 30.2831C62.0367 20.6903 72.2777 14.7429 83.4018 14.6036L94.4188 14.4656C99.7794 14.3984 105.036 12.9759 109.699 10.3306L119.281 4.89431Z";
    
    const [pathLength, setPathLength] = useState(0);

    useEffect(() => {
        if (page === 'execution' && timerPathRef.current) {
            setPathLength(timerPathRef.current.getTotalLength());
        }
    }, [page]);


    return (
        <main id="app-container">
            <header id="top-app-bar">
                <button id="back-btn" className="icon-button ripple-surface" onClick={handleBack} style={{ display: page === 'home' ? 'none' : 'inline-flex' }}>
                    <span className="material-symbols-outlined text-gray-700">arrow_back</span>
                </button>
                <h1 id="app-title" className="title-large text-gray-800">{pageTitles[page]}</h1>
            </header>

            <div id="home-screen" className={`screen ${page === 'home' ? 'active' : ''}`}>
                <div className="grid grid-cols-1 gap-4">
                    <button onClick={() => navigateTo('table-selection')} className="app-card ripple-surface" onMouseDown={createRipple}>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)]">
                                <span className="material-symbols-outlined text-[var(--md-sys-color-on-primary-container)]">close</span>
                            </div>
                            <div>
                                <p className="title-medium">Multiplication Tables</p>
                                <p className="body-medium text-[var(--md-sys-color-on-surface-variant)]">Practice your times tables</p>
                            </div>
                        </div>
                    </button>
                    <button onClick={() => navigateTo('practice-config')} className="app-card ripple-surface" onMouseDown={createRipple}>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--md-sys-color-secondary-container)]">
                                <span className="material-symbols-outlined text-[var(--md-sys-color-on-secondary-container)]">calculate</span>
                            </div>
                            <div>
                                <p className="title-medium">Multiplication Practice</p>
                                <p className="body-medium text-[var(--md-sys-color-on-surface-variant)]">Solve multi-digit problems</p>
                            </div>
                        </div>
                    </button>
                    <button onClick={() => navigateTo('powers-config')} className="app-card ripple-surface" onMouseDown={createRipple}>
                         <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#E6F4EA]">
                                <span className="material-symbols-outlined text-[#137333]">superscript</span>
                            </div>
                            <div>
                                <p className="title-medium">Powers & Roots</p>
                                <p className="body-medium text-[var(--md-sys-color-on-surface-variant)]">Practice squares, cubes, and roots</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <div id="table-selection-screen" className={`screen flex-col sm:px-6 md:px-8 lg:px-12 ${page === 'table-selection' ? 'active' : ''}`}>
                <div className="text-center mb-4 flex-shrink-0">
                    <p className="body-large text-[var(--md-sys-color-on-surface-variant)]">Choose the tables you want to practice.</p>
                </div>
                <div id="number-grid" className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 flex-grow overflow-y-auto">
                    {Array.from({ length: 29 }, (_, i) => i + 2).map(num => (
                        <button key={num} onClick={() => handleTableSelection(num)} onMouseDown={createRipple} className={`number-chip ripple-surface label-large ${selectedTables.includes(num) ? 'selected' : ''}`}>
                            {num}
                        </button>
                    ))}
                </div>
                <div className="flex-shrink-0 mt-4">
                    <div className="text-field !mt-0">
                        <input 
                            type="number" 
                            id="tables-timer-input" 
                            placeholder=" " 
                            autoComplete="off" 
                            className="text-center title-medium" 
                            value={tablesTimer === undefined ? '' : tablesTimer}
                            onChange={(e) => handleTimerChange('tables', e.target.value)}
                        />
                        <label htmlFor="tables-timer-input" className="body-large">Seconds per question</label>
                    </div>
                    <p className="label-medium text-center text-[var(--md-sys-color-on-surface-variant)] mt-2">Enter 0 or leave blank for no timer.</p>
                </div>
                <div className="min-h-[24px] text-center my-2">
                    {configError && <span className="body-medium text-red-600">{configError}</span>}
                </div>
                <div className="flex justify-end pt-2 flex-shrink-0">
                    <button onClick={() => handleStartClick('tables')} className="filled-button ripple-surface" onMouseDown={createRipple}>
                        <span className="label-large">Start</span>
                    </button>
                </div>
            </div>

            <div id="practice-config-screen" className={`screen flex-col sm:px-6 md:px-8 lg:px-12 ${page === 'practice-config' ? 'active' : ''}`}>
                <div className="flex-grow">
                    <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mb-2">Digits in first number:</p>
                    <div id="digits1-chips" className="flex flex-wrap gap-2 mb-6">
                        {[2,3,4,5].map(digit => (
                            <button key={`d1-${digit}`} onClick={() => handleDigitSelection('digits1', digit)} onMouseDown={createRipple} className={`choice-chip ripple-surface label-large ${selectedDigits1.includes(digit) ? 'selected' : ''}`}>
                                <span className="material-symbols-outlined">done</span><span>{digit}</span>
                            </button>
                        ))}
                    </div>
                    <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mb-2">Digits in second number:</p>
                    <div id="digits2-chips" className="flex flex-wrap gap-2">
                        {[2,3,4,5].map(digit => (
                            <button key={`d2-${digit}`} onClick={() => handleDigitSelection('digits2', digit)} onMouseDown={createRipple} className={`choice-chip ripple-surface label-large ${selectedDigits2.includes(digit) ? 'selected' : ''}`}>
                                <span className="material-symbols-outlined">done</span><span>{digit}</span>
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="flex-shrink-0 mt-6">
                    <div className="text-field !mt-0">
                        <input 
                            type="number" 
                            id="practice-timer-input" 
                            placeholder=" " 
                            autoComplete="off" 
                            className="text-center title-medium"
                            value={practiceTimer === undefined ? '' : practiceTimer}
                            onChange={(e) => handleTimerChange('practice', e.target.value)}
                        />
                        <label htmlFor="practice-timer-input" className="body-large">Seconds per question</label>
                    </div>
                    <p className="label-medium text-center text-[var(--md-sys-color-on-surface-variant)] mt-2">Enter 0 or leave blank for no timer.</p>
                </div>
                 <div className="min-h-[24px] text-center my-2">
                    {configError && <span className="body-medium text-red-600">{configError}</span>}
                </div>
                <div className="flex justify-end pt-2 flex-shrink-0">
                    <button onClick={() => handleStartClick('practice')} className="filled-button ripple-surface" onMouseDown={createRipple}>
                        <span className="label-large">Start Practice</span>
                    </button>
                </div>
            </div>

            <div id="powers-config-screen" className={`screen flex-col sm:px-6 md:px-8 lg:px-12 ${page === 'powers-config' ? 'active' : ''}`}>
                 <div className="flex-grow">
                     <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mb-2">Practice Types:</p>
                     <div id="powers-chips" className="flex flex-wrap gap-2 mb-6">
                         {(['squares', 'cubes', 'square_roots', 'cube_roots'] as PowerType[]).map(type => (
                             <button key={type} onClick={() => handlePowerSelection(type)} onMouseDown={createRipple} className={`choice-chip ripple-surface label-large ${selectedPowers.includes(type) ? 'selected' : ''}`}>
                                 <span className="material-symbols-outlined">done</span>
                                 <span>{ {squares: 'Squares (x²)', cubes: 'Cubes (x³)', square_roots: 'Square Roots (√x)', cube_roots: 'Cube Roots (³√x)'}[type] }</span>
                             </button>
                         ))}
                     </div>
                     <p className="body-large text-[var(--md-sys-color-on-surface-variant)] mb-2">Number Range:</p>
                     <div className="range-slider-wrapper">
                        <span id="slider-value-label" ref={sliderLabelRef}>{powersRangeMax}</span>
                        <input type="range" id="powers-range-slider" min="2" max="30" value={powersRangeMax} onChange={handleSliderChange} ref={sliderRef} />
                        <div className="flex justify-between mt-2 body-medium text-[var(--md-sys-color-on-surface-variant)]">
                            <span>2</span>
                            <span>30</span>
                        </div>
                     </div>
                     <p id="powers-helper-note" className={`label-medium text-center text-[var(--md-sys-color-on-surface-variant)] mt-2 ${!(hasCubeSelection && isPowerRangeAbove20) ? 'hidden' : ''}`}>
                        Note: Cube and cube root questions will only be generated for numbers up to 20.
                     </p>
                </div>
                <div className="flex-shrink-0 mt-6">
                    <div className="text-field !mt-0">
                        <input 
                            type="number" 
                            id="powers-timer-input" 
                            placeholder=" " 
                            autoComplete="off" 
                            className="text-center title-medium"
                            value={powersTimer === undefined ? '' : powersTimer}
                            onChange={(e) => handleTimerChange('powers', e.target.value)}
                        />
                        <label htmlFor="powers-timer-input" className="body-large">Seconds per question</label>
                    </div>
                    <p className="label-medium text-center text-[var(--md-sys-color-on-surface-variant)] mt-2">Enter 0 or leave blank for no timer.</p>
                </div>
                 <div className="min-h-[24px] text-center my-2">
                    {configError && <span className="body-medium text-red-600">{configError}</span>}
                </div>
                 <div className="flex justify-end pt-2 flex-shrink-0">
                    <button onClick={() => handleStartClick('powers')} className="filled-button ripple-surface" onMouseDown={createRipple}>
                        <span className="label-large">Start Practice</span>
                    </button>
                </div>
            </div>

            <div id="execution-screen" className={`screen justify-start text-center pt-8 sm:px-6 md:px-8 lg:px-12 ${page === 'execution' ? 'active' : ''}`}>
                <div className="w-full max-w-sm">
                    {countdown !== null && activeTimerDuration && (
                        <div className="relative w-32 h-32 mx-auto mb-4 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
                            <svg className="w-full h-full -rotate-90" viewBox="-12 -12 294 297">
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
                                <span className="headline-large sm:headline-large lg:display-small text-[var(--md-sys-color-on-surface-variant)]">{countdown}</span>
                            </div>
                        </div>
                    )}
                    <p id="question-text" className={`my-4 text-[var(--md-sys-color-on-surface)] flex justify-center items-center ${getQuestionSizeClass()}`} dangerouslySetInnerHTML={{ __html: question }}></p>
                    <form id="answer-form" className="mt-4" onSubmit={checkAnswer}>
                        <div className="text-field">
                            <input type="number" id="answer-input" placeholder=" " autoComplete="off" className="text-center title-large" ref={answerInputRef} />
                            <label htmlFor="answer-input" className="body-large">Your Answer</label>
                        </div>
                        <button type="submit" className={`${isAnswerRevealed ? 'filled-button' : 'tonal-button'} ripple-surface w-full mt-6`} onMouseDown={createRipple}>
                            <span className="label-large">{isAnswerRevealed ? 'Next' : 'Check'}</span>
                        </button>
                    </form>
                    <div id="feedback-container" className="mt-6 min-h-[40px] sm:min-h-[48px]" dangerouslySetInnerHTML={{ __html: feedback }}></div>
                </div>
            </div>

        </main>
    );
}
