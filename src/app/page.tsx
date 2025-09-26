'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// Define types for state
type Page = 'home' | 'table-selection' | 'practice-config' | 'powers-config' | 'execution';
type Mode = '' | 'tables' | 'practice' | 'powers';
type PowerType = 'squares' | 'cubes' | 'square_roots' | 'cube_roots';

export default function Home() {
    const [page, setPage] = useState<Page>('home');
    const [mode, setMode] = useState<Mode>('');
    
    // Config states
    const [selectedTables, setSelectedTables] = useState<number[]>([]);
    const [selectedDigits1, setSelectedDigits1] = useState<number[]>([]);
    const [selectedDigits2, setSelectedDigits2] = useState<number[]>([]);
    const [selectedPowers, setSelectedPowers] = useState<PowerType[]>([]);
    const [powersRangeMax, setPowersRangeMax] = useState(30);

    // Execution state
    const [currentAnswer, setCurrentAnswer] = useState(0);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
    const [question, setQuestion] = useState('');
    const [feedback, setFeedback] = useState('');

    const answerInputRef = useRef<HTMLInputElement>(null);
    const sliderRef = useRef<HTMLInputElement>(null);
    const sliderLabelRef = useRef<HTMLSpanElement>(null);

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
        if (['table-selection', 'practice-config', 'powers-config'].includes(page)) {
            setPage('home');
        } else if (page === 'execution') {
            const prevPage = mode === 'tables' ? 'table-selection' : mode === 'practice' ? 'practice-config' : 'powers-config';
            setPage(prevPage);
        }
    };
    
    const startExecution = (execMode: Mode) => {
        setMode(execMode);
        setPage('execution');
    };

    const displayQuestion = useCallback(() => {
        setIsAnswerRevealed(false);
        setFeedback('');
        if(answerInputRef.current) {
            answerInputRef.current.value = '';
            answerInputRef.current.disabled = false;
        }

        let questionString = '';
        let answer = 0;

        if (mode === 'tables') {
            const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
            const multiplier = Math.floor(Math.random() * 10) + 1;
            answer = table * multiplier;
            questionString = `${table} &times; ${multiplier}`;
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
        } else if (mode === 'powers') {
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
        setTimeout(() => answerInputRef.current?.focus(), 100);

    }, [mode, selectedTables, selectedDigits1, selectedDigits2, selectedPowers, powersRangeMax]);

    useEffect(() => {
        if (page === 'execution') {
            displayQuestion();
        }
    }, [page, displayQuestion]);

    const checkAnswer = (event: React.FormEvent) => {
        event.preventDefault();
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

    const handleTableSelection = (table: number) => {
        setSelectedTables(prev => 
            prev.includes(table) ? prev.filter(n => n !== table) : [...prev, table]
        );
    };

    const handleDigitSelection = (group: 'digits1' | 'digits2', digit: number) => {
        const setter = group === 'digits1' ? setSelectedDigits1 : setSelectedDigits2;
        setter(prev => 
            prev.includes(digit) ? prev.filter(d => d !== digit) : [...prev, digit]
        );
    };

    const handlePowerSelection = (powerType: PowerType) => {
        setSelectedPowers(prev =>
            prev.includes(powerType) ? prev.filter(p => p !== powerType) : [...prev, powerType]
        );
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setPowersRangeMax(value);
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
        if (len >= 11) return 'display-small';
        if (len >= 8) return 'display-medium';
        return 'display-large';
    };

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
                    <button onClick={() => setPage('table-selection')} className="app-card ripple-surface" onMouseDown={createRipple}>
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
                    <button onClick={() => setPage('practice-config')} className="app-card ripple-surface" onMouseDown={createRipple}>
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
                    <button onClick={() => setPage('powers-config')} className="app-card ripple-surface" onMouseDown={createRipple}>
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

            <div id="table-selection-screen" className={`screen flex-col ${page === 'table-selection' ? 'active' : ''}`}>
                <div className="text-center mb-4 flex-shrink-0">
                    <p className="body-large text-[var(--md-sys-color-on-surface-variant)]">Choose the tables you want to practice.</p>
                </div>
                <div id="number-grid" className="grid grid-cols-4 sm:grid-cols-5 gap-2 flex-grow">
                    {Array.from({ length: 29 }, (_, i) => i + 2).map(num => (
                        <button key={num} onClick={() => handleTableSelection(num)} onMouseDown={createRipple} className={`number-chip ripple-surface label-large ${selectedTables.includes(num) ? 'selected' : ''}`}>
                            {num}
                        </button>
                    ))}
                </div>
                <div className="flex justify-end pt-4 flex-shrink-0">
                    <button onClick={() => startExecution('tables')} className="filled-button ripple-surface" disabled={selectedTables.length === 0} onMouseDown={createRipple}>
                        <span className="label-large">Start</span>
                    </button>
                </div>
            </div>

            <div id="practice-config-screen" className={`screen flex-col ${page === 'practice-config' ? 'active' : ''}`}>
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
                <div className="flex justify-end pt-4 flex-shrink-0">
                    <button onClick={() => startExecution('practice')} className="filled-button ripple-surface" disabled={selectedDigits1.length === 0 || selectedDigits2.length === 0} onMouseDown={createRipple}>
                        <span className="label-large">Start Practice</span>
                    </button>
                </div>
            </div>

            <div id="powers-config-screen" className={`screen flex-col ${page === 'powers-config' ? 'active' : ''}`}>
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
                 <div className="flex justify-end pt-4 flex-shrink-0">
                    <button onClick={() => startExecution('powers')} className="filled-button ripple-surface" disabled={selectedPowers.length === 0} onMouseDown={createRipple}>
                        <span className="label-large">Start Practice</span>
                    </button>
                </div>
            </div>

            <div id="execution-screen" className={`screen justify-center text-center ${page === 'execution' ? 'active' : ''}`}>
                <div className="w-full max-w-sm -mt-14">
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
                    <div id="feedback-container" className="mt-6 min-h-[40px]" dangerouslySetInnerHTML={{ __html: feedback }}></div>
                </div>
            </div>

        </main>
    );
}
