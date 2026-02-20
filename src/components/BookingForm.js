import { useState, useEffect, useCallback } from 'react';
import './BookingForm.css';

const FORM_BASE_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScjkQJ-zXpR-GW-cXaXnpCyiX0vU_vemeCXL7g4weWQhfCKiA/viewform';

const QUESTIONS = [
  {
    key: 'fullName',
    label: "What's your full name?",
    type: 'text',
    placeholder: 'Enter your full name',
    required: true,
    entryId: '875766835'
  },
  {
    key: 'email',
    label: "What's your email address?",
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
    entryId: '1413057595'
  },
  {
    key: 'phone',
    label: "What's your phone number?",
    type: 'tel',
    placeholder: '(555) 123-4567',
    required: false,
    entryId: '584827614'
  },
  {
    key: 'eventType',
    label: 'What type of event are you planning?',
    type: 'radio',
    required: true,
    entryId: '1377538583',
    options: ['Corporate Event', 'Non-profit Event', 'Wedding', 'Private Party', 'Other']
  },
  {
    key: 'entertainmentType',
    label: 'What type of entertainment are you interested in?',
    subtitle: 'Select all that apply',
    type: 'checkbox',
    required: false,
    entryId: '1559182562',
    options: ["DJ's", 'Hosts', 'Auctioneers - Auction Crasher', 'Live Band', 'DJ Hybrid band - The Sessions', 'Solo Musicians - Acoustic set']
  },
  {
    key: 'experienceType',
    label: 'What type of experience are you looking for?',
    subtitle: 'Select all that apply',
    type: 'checkbox',
    required: false,
    entryId: '242234976',
    options: ['Silent Disco', 'Karaoke', "Rhodey's Playhouse Variety show", 'Interactive Game Shows', 'Fitness events', 'Custom experience']
  },
  {
    key: 'attendeeCount',
    label: 'How many people are attending the event?',
    type: 'radio',
    required: false,
    entryId: '1155128903',
    options: ['0-50 people', '50-100 people', '100-150 people', '150-300 people', 'over 300 people']
  },
  {
    key: 'eventDate',
    label: 'When is the event?',
    type: 'date',
    required: true,
    entryId: '251535084'
  },
  {
    key: 'startTime',
    label: 'What time does the event start?',
    type: 'time',
    required: true,
    entryId: '1110729968'
  },
  {
    key: 'endTime',
    label: 'What time does the event end?',
    type: 'time',
    required: false,
    entryId: '1885520836'
  },
  {
    key: 'eventLocation',
    label: 'Where is the event?',
    type: 'text',
    placeholder: 'Venue name or address',
    required: true,
    entryId: '2126122339'
  },
  {
    key: 'readyToBook',
    label: 'Are you ready to book entertainment right now?',
    type: 'radio',
    required: true,
    entryId: '1476315677',
    options: ['Yes', 'No']
  },
  {
    key: 'meetingRequest',
    label: 'Would you like to set up a time to meet?',
    type: 'radio',
    required: false,
    entryId: '1332814174',
    options: ['Yes', 'No'],
    condition: (answers) => answers.readyToBook === 'No'
  },
  {
    key: 'additionalNotes',
    label: 'Any additional notes or special requests?',
    type: 'textarea',
    placeholder: 'Tell us anything else about your event...',
    required: false,
    entryId: '1909146076'
  }
];

const BookingForm = ({ isOpen, onClose, price }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState('forward');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Get visible questions (filter out conditional ones that don't apply)
  const visibleQuestions = QUESTIONS.filter(
    (q) => !q.condition || q.condition(answers)
  );

  const totalSteps = visibleQuestions.length;
  const currentQuestion = visibleQuestions[currentStep];
  const progress = ((currentStep) / totalSteps) * 100;

  // Log answers whenever they change
  useEffect(() => {
    console.log('Booking form answers:', answers);
  }, [answers]);

  // Reset state when form opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setAnswers({});
      setDirection('forward');
      setIsSubmitting(false);
      setIsComplete(false);
      setValidationError('');
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const validateCurrent = () => {
    if (!currentQuestion.required) return true;
    const value = answers[currentQuestion.key];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      setValidationError('This field is required');
      return false;
    }
    if (currentQuestion.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setValidationError('Please enter a valid email address');
        return false;
      }
    }
    setValidationError('');
    return true;
  };

  const goNext = () => {
    if (!validateCurrent()) return;
    setValidationError('');
    if (currentStep < totalSteps - 1) {
      setDirection('forward');
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    setValidationError('');
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleTextChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (validationError) setValidationError('');
  };

  const handleRadioChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (validationError) setValidationError('');
  };

  const handleCheckboxChange = (key, value) => {
    setAnswers((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
    if (validationError) setValidationError('');
  };

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter' && currentQuestion.type !== 'textarea') {
      e.preventDefault();
      goNext();
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const submissionData = {
      ...answers,
      price: price || '',
      submittedAt: new Date().toISOString()
    };
    console.log('=== FORM SUBMITTED ===');
    console.log('Submission data with timestamp:', submissionData);

    // Build pre-filled URL
    const params = new URLSearchParams();
    params.append('usp', 'pp_url');

    QUESTIONS.forEach((q) => {
      if (q.condition && !q.condition(answers)) return;
      const value = answers[q.key];
      if (!value) return;

      if (q.type === 'checkbox' && Array.isArray(value)) {
        value.forEach((v) => {
          params.append(`entry.${q.entryId}`, v);
        });
      } else {
        params.append(`entry.${q.entryId}`, value);
      }
    });

    const prefilledUrl = `${FORM_BASE_URL}?${params.toString()}`;

    // Open pre-filled form in new tab
    window.open(prefilledUrl, '_blank');

    setIsSubmitting(false);
    setIsComplete(true);
  };

  if (!isOpen) return null;

  if (isComplete) {
    return (
      <div className="booking-overlay">
        <div className="booking-container">
          <button className="booking-close" onClick={onClose} aria-label="Close form">
            <span>&times;</span>
          </button>
          <div className="booking-complete">
            <div className="complete-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2>Almost Done!</h2>
            <p>We've opened the booking form with your answers pre-filled. Please click <strong>Submit</strong> on that page to complete your request.</p>
            <button className="booking-done-btn" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  const renderInput = () => {
    if (!currentQuestion) return null;
    const { key, type, placeholder, options } = currentQuestion;
    const value = answers[key];

    if (type === 'text' || type === 'email' || type === 'tel') {
      return (
        <input
          type={type}
          className="booking-input"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => handleTextChange(key, e.target.value)}
          onKeyDown={handleTextKeyDown}
          autoFocus
        />
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          className="booking-input booking-textarea"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => handleTextChange(key, e.target.value)}
          rows={4}
          autoFocus
        />
      );
    }

    if (type === 'date') {
      return (
        <input
          type="date"
          className="booking-input"
          value={value || ''}
          onChange={(e) => handleTextChange(key, e.target.value)}
          onKeyDown={handleTextKeyDown}
          autoFocus
        />
      );
    }

    if (type === 'time') {
      return (
        <input
          type="time"
          className="booking-input"
          value={value || ''}
          onChange={(e) => handleTextChange(key, e.target.value)}
          onKeyDown={handleTextKeyDown}
          autoFocus
        />
      );
    }

    if (type === 'radio') {
      return (
        <div className="booking-options">
          {options.map((option) => (
            <button
              key={option}
              className={`booking-option ${value === option ? 'selected' : ''}`}
              onClick={() => handleRadioChange(key, option)}
            >
              <span className="option-indicator">
                {value === option ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ) : (
                  <span className="option-circle"></span>
                )}
              </span>
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (type === 'checkbox') {
      const selected = value || [];
      return (
        <div className="booking-options">
          {options.map((option) => (
            <button
              key={option}
              className={`booking-option ${selected.includes(option) ? 'selected' : ''}`}
              onClick={() => handleCheckboxChange(key, option)}
            >
              <span className="option-indicator">
                {selected.includes(option) ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ) : (
                  <span className="option-square"></span>
                )}
              </span>
              {option}
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="booking-overlay">
      <div className="booking-container">
        <button className="booking-close" onClick={onClose} aria-label="Close form">
          <span>&times;</span>
        </button>

        {/* Progress Bar */}
        <div className="booking-progress">
          <div className="booking-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="booking-step-count">
          {currentStep + 1} of {totalSteps}
        </div>

        {/* Question */}
        <div className={`booking-question ${direction}`} key={currentStep}>
          <h2 className="booking-label">{currentQuestion.label}</h2>
          {currentQuestion.subtitle && (
            <p className="booking-subtitle">{currentQuestion.subtitle}</p>
          )}
          {!currentQuestion.required && (
            <span className="booking-optional">Optional</span>
          )}

          <div className="booking-field">
            {renderInput()}
          </div>

          {validationError && (
            <p className="booking-error">{validationError}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="booking-nav">
          {currentStep > 0 && (
            <button className="booking-back-btn" onClick={goBack}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back
            </button>
          )}
          <button
            className={`booking-next-btn ${isLastStep ? 'submit' : ''}`}
            onClick={goNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="booking-spinner"></span>
            ) : isLastStep ? (
              'Submit'
            ) : (
              <>
                Next
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
