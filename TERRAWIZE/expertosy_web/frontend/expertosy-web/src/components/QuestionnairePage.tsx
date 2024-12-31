import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface QuestionOption {
  text: string;
}

interface Question {
  question: string;
  options: QuestionOption[];
}

const QuestionnairePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [questionnaire, setQuestionnaire] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Analyzing your request...');

  useEffect(() => {
    let mounted = true;
    const state = location.state as { searchQuery?: string, factors?: string[] };
    
    if (!state?.searchQuery || !state?.factors) {
      navigate('/');
      return;
    }

    setSearchQuery(state.searchQuery);

    // Simulate loading stages for better UX
    const loadingStages = [
      { text: 'Analyzing your request...', duration: 1000 },
      { text: 'Gathering expert insights...', duration: 1500 },
      { text: 'Crafting personalized questions...', duration: 1000 },
      { text: 'Finalizing your questionnaire...', duration: 500 }
    ];

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      if (currentProgress < 100) {
        currentProgress += 1;
        if (mounted) setLoadingProgress(currentProgress);
      }
    }, 40);

    let currentStageIndex = 0;
    const updateStage = () => {
      if (currentStageIndex < loadingStages.length && mounted) {
        setLoadingStage(loadingStages[currentStageIndex].text);
        currentStageIndex++;
        if (currentStageIndex < loadingStages.length) {
          setTimeout(updateStage, loadingStages[currentStageIndex - 1].duration);
        }
      }
    };
    updateStage();

    const generateQuestionnaire = async () => {
      try {
        if (!mounted) return;
        
        console.log('Generating questionnaire for:', state.searchQuery);
        console.log('With factors:', state.factors);

        const questionnaireResponse = await axios.post('http://localhost:5001/create-questionnaire', {
          search_query: state.searchQuery,
          factors: state.factors
        }, {
          timeout: 60000 // 60 seconds timeout
        });

        if (!mounted) return;

        if (!questionnaireResponse.data?.questionnaire) {
          throw new Error('No questionnaire data received from server');
        }

        console.log('Raw questionnaire response:', questionnaireResponse.data);

        const parsedQuestionnaire = parseQuestionnaire(questionnaireResponse.data.questionnaire);

        if (!parsedQuestionnaire || parsedQuestionnaire.length === 0) {
          throw new Error('No questions were parsed from the response');
        }

        console.log('Successfully parsed questionnaire:', parsedQuestionnaire);

        if (!mounted) return;
        setQuestionnaire(parsedQuestionnaire);
        setIsLoading(false);
        setTimeout(() => setShowQuestion(true), 300);
      } catch (error) {
        if (!mounted) return;
        
        console.error('Error in generateQuestionnaire:', error);
        if (axios.isAxiosError(error)) {
          console.error('Network Error Details:', {
            response: error.response?.data,
            status: error.response?.status,
            message: error.message
          });
        }
        setIsLoading(false);
        alert(`Failed to generate questionnaire: ${error instanceof Error ? error.message : 'Unknown error'}`);
        navigate('/');
      }
    };

    generateQuestionnaire();

    return () => {
      mounted = false;
      clearInterval(progressInterval);
    };
  }, [navigate, location.state]);

  const parseQuestionnaire = (questionnaireText: string): Question[] => {
    if (!questionnaireText) {
      throw new Error('No questionnaire text provided');
    }

    console.log('Starting to parse questionnaire text');
    const questions: Question[] = [];
    
    try {
      // Split into sections by numbered headers
      const sections = questionnaireText
        .split(/(?:####|###)\s*\d+\.|(?:\*\*\d+\.)/g)
        .filter(Boolean)
        .map(section => section.trim());
      
      console.log(`Found ${sections.length} sections to parse`);
      
      if (sections.length === 0) {
        throw new Error('No sections found in questionnaire');
      }

      sections.forEach((section, index) => {
        // Skip introduction and thank you sections
        if (section.includes('Thank you') || 
            section.includes('### Comprehensive') || 
            section.includes('Please select') ||
            !section.trim()) {
          return;
        }
        
        // Split section into lines and clean them
        const lines = section
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .filter(line => !line.startsWith('###')); // Remove section headers
        
        // Find the question text
        let questionLine = '';
        const questionLines = lines.filter(line => 
          line.includes('?') && 
          !line.startsWith('-') && 
          !line.startsWith('*')
        );

        if (questionLines.length > 0) {
          // Take the longest question line (usually the most complete)
          questionLine = questionLines.reduce((a, b) => a.length > b.length ? a : b);
          // Remove any markdown formatting from the question
          questionLine = questionLine.replace(/\*\*/g, '').trim();
        }
        
        if (!questionLine) {
          console.log(`No question found in section ${index + 1}`);
          return;
        }

        // Find all options
        const options: QuestionOption[] = [];
        const seenOptions = new Set<string>();

        lines.forEach(line => {
          // Match various option formats with complete text including costs and details
          const optionPatterns = [
            // A) or A. format with optional bullet and full details
            /^-?\s*[A-D][\.\)]\s*(.+?)(?:\s*$)/,
            // Descriptive format with costs and details
            /^(?:Very|Highly|Mostly|Somewhat|Not|Low|Medium|High|Soft|Firm|Minimal|Regular|Important|Adjustable)\s+.+$/
          ];

          for (const pattern of optionPatterns) {
            const match = line.match(pattern);
            if (match) {
              // Keep the full option text including costs and details
              let optionText = match[1] || line;
              
              // Clean up the option text while preserving costs and details
              optionText = optionText
                .replace(/\*\*/g, '')  // Remove markdown
                .replace(/^-\s*/, '')  // Remove bullet points
                .trim();

              // Only add if it's a unique option and not empty
              if (!seenOptions.has(optionText) && optionText.length > 0) {
                seenOptions.add(optionText);
                options.push({ text: optionText });
                console.log('Found option:', optionText);
              }
              break;
            }
          }
        });

        // Filter out any options that are actually questions
        const validOptions = options.filter(opt => !opt.text.includes('?'));

        if (validOptions.length >= 2) {
          // Sort options to ensure A, B, C, D order
          validOptions.sort((a, b) => {
            const aMatch = a.text.match(/^[A-D][\.\)]/);
            const bMatch = b.text.match(/^[A-D][\.\)]/);
            if (aMatch && bMatch) {
              return aMatch[0].charCodeAt(0) - bMatch[0].charCodeAt(0);
            }
            return 0;
          });

          questions.push({
            question: questionLine.trim(),
            options: validOptions
          });
          console.log(`Added question: "${questionLine.trim()}" with ${validOptions.length} options`);
        } else {
          console.log(`Skipping section ${index + 1} - insufficient valid options found`);
        }
      });

      if (questions.length === 0) {
        throw new Error('No valid questions could be parsed from the questionnaire');
      }

      console.log(`Successfully parsed ${questions.length} questions`);
      return questions;

    } catch (error) {
      console.error('Error parsing questionnaire:', error);
      console.error('Questionnaire text that failed to parse:', questionnaireText);
      throw new Error(`Failed to parse questionnaire: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleOptionSelect = (option: string) => {
    const currentQuestion = questionnaire[currentQuestionIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.question]: option
    }));

    setShowQuestion(false);
    setTimeout(() => {
      if (currentQuestionIndex < questionnaire.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowQuestion(true);
      } else {
        generateRecommendation();
      }
    }, 300);
  };

  const handlePrevious = () => {
    setShowQuestion(false);
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowQuestion(true);
    }, 300);
  };

  const generateRecommendation = async () => {
    try {
      const recommendationResponse = await axios.post('http://localhost:5001/generate-recommendation', {
        search_query: searchQuery,
        user_preferences: userAnswers
      });

      navigate('/results', { 
        state: { 
          searchQuery, 
          userPreferences: userAnswers,
          recommendation: recommendationResponse.data.recommendation 
        } 
      });
    } catch (error) {
      console.error('Error generating recommendation:', error);
      alert('Failed to generate recommendation. Please try again.');
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="questionnaire-page loading">
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-icon">
              <div className="pulse-ring"></div>
              <span className="icon">🎯</span>
            </div>
            <h2>{loadingStage}</h2>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <span className="progress-text">{loadingProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questionnaire.length === 0) {
    return (
      <div className="questionnaire-page error">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <h2>No questionnaire available</h2>
          <p>We couldn't generate questions for your request. Please try again.</p>
          <button onClick={() => navigate('/')} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questionnaire[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.length) * 100;

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-container">
        <div className="questionnaire-header">
          <h2>Personalizing recommendations for <span className="highlight">{searchQuery}</span></h2>
          
          <div className="progress-container">
            <div className="progress-text">
              <span>Question {currentQuestionIndex + 1} of {questionnaire.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className={`question-section ${showQuestion ? 'fade-in' : 'fade-out'}`}>
          <div className="question-card">
            <div className="question-number">
              <span className="current">{currentQuestionIndex + 1}</span>
              <span className="total">/{questionnaire.length}</span>
            </div>
            
            <h3 className="question-text">{currentQuestion.question}</h3>
            
            <div className="options-grid">
              {currentQuestion.options.map((option, index) => {
                const optionLabel = String.fromCharCode(65 + index);
                const isSelected = userAnswers[currentQuestion.question] === option.text;
                
                return (
                  <button 
                    key={index} 
                    className={`option-button ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option.text)}
                  >
                    <div className="option-content">
                      <span className="option-label">{optionLabel}</span>
                      <span className="option-text">{option.text}</span>
                    </div>
                    {isSelected && <span className="check-mark">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="navigation-buttons">
          {currentQuestionIndex > 0 && (
            <button 
              className="nav-button previous"
              onClick={handlePrevious}
            >
              <span className="button-icon">←</span>
              Previous Question
            </button>
          )}
          {currentQuestionIndex < questionnaire.length - 1 && userAnswers[currentQuestion.question] && (
            <button 
              className="nav-button next"
              onClick={() => handleOptionSelect(userAnswers[currentQuestion.question])}
            >
              Next Question
              <span className="button-icon">→</span>
            </button>
          )}
          {currentQuestionIndex === questionnaire.length - 1 && userAnswers[currentQuestion.question] && (
            <button 
              className="nav-button submit"
              onClick={generateRecommendation}
            >
              Get Your Recommendation
              <span className="button-icon">✨</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage; 