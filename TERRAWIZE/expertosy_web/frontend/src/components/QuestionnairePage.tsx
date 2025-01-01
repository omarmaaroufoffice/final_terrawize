import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import RankingQuestionnaire from './RankingQuestionnaire';
import { motion, AnimatePresence } from 'framer-motion';
import './QuestionnairePage.css';

interface QuestionOption {
  text: string;
  description?: string;
  icon?: string;
}

interface Question {
  question: string;
  options: QuestionOption[];
  category?: string;
  helpText?: string;
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
  const [showRankingQuestionnaire, setShowRankingQuestionnaire] = useState(false);
  const [products, setProducts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showHelpText, setShowHelpText] = useState(false);
  const [currentStage, setCurrentStage] = useState('analyzing');
  const [recommendedProducts, setRecommendedProducts] = useState<string[]>([]);

  // Animation variants for framer-motion
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const questionVariants = {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  };

  useEffect(() => {
    let mounted = true;
    const state = location.state as { searchQuery?: string, factors?: string[] };
    
    if (!state?.searchQuery || !state?.factors) {
      navigate('/', { replace: true });
      return;
    }

    setSearchQuery(state.searchQuery);

    const loadingStages = [
      { text: 'Analyzing your request...', duration: 1000 },
      { text: 'Gathering expert insights...', duration: 1500 },
      { text: 'Crafting personalized questions...', duration: 1000 },
      { text: 'Optimizing for your preferences...', duration: 1000 },
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
        setIsLoading(true);
        setError(null);
        
        // Use the factors from state instead of making another API call
        if (state.factors && Array.isArray(state.factors)) {
          // Transform factors into Question objects with default options
          const questions = state.factors.map(factor => ({
            question: factor,
            options: [
              { text: 'Very Important', description: 'This factor is crucial to my decision', icon: '⭐⭐⭐' },
              { text: 'Important', description: 'This factor matters significantly', icon: '⭐⭐' },
              { text: 'Somewhat Important', description: 'This factor is worth considering', icon: '⭐' },
              { text: 'Not Important', description: 'This factor is not a priority', icon: '✖️' }
            ],
            category: getCategoryFromQuestion(factor),
            helpText: generateHelpText(factor)
          }));
          setQuestionnaire(questions);
          setShowQuestion(true);
        } else {
          console.error('Invalid factors format:', state.factors);
          setError('Received invalid factors format. Please try again.');
        }
      } catch (err) {
        console.error('Error setting up questionnaire:', err);
        setError('Failed to set up questionnaire. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    generateQuestionnaire();

    return () => {
      mounted = false;
      clearInterval(progressInterval);
    };
  }, [navigate, location.state, retryCount]);

  const parseQuestionnaire = useCallback((questionnaireText: string): Question[] => {
    if (!questionnaireText) {
      throw new Error('No questionnaire text provided');
    }

    const questions: Question[] = [];
    
    try {
      // Split by question numbers (1., 2., etc.)
      const sections = questionnaireText
        .split(/(?:\d+\.)/g)
        .filter(Boolean)
        .map(section => section.trim());
      
      if (sections.length === 0) {
        throw new Error('No sections found in questionnaire');
      }

      sections.forEach((section) => {
        if (section.includes('Thank you') || 
            section.includes('### Comprehensive') || 
            section.includes('Please select') ||
            !section.trim()) {
          return;
        }
        
        const lines = section
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
        
        // Find the question line (should be the first non-empty line)
        const questionLine = lines[0]?.replace(/\*\*/g, '').trim();
        
        if (!questionLine) return;

        const options: QuestionOption[] = [];
        const seenOptions = new Set<string>();

        // Process remaining lines for options
        lines.slice(1).forEach(line => {
          // Match options starting with A), B), C), D)
          const optionMatch = line.match(/^([A-D]\))\s*(.+)$/);
          
          if (optionMatch) {
            const optionText = optionMatch[2].trim();
            
            if (!seenOptions.has(optionText) && optionText.length > 0) {
              seenOptions.add(optionText);
              
              // Extract any additional description after a dash or colon
              const [mainText, ...descriptionParts] = optionText.split(/[-–:]/).map(part => part.trim());
              const description = descriptionParts.join(' ').trim();
              
              options.push({ 
                text: mainText,
                description: description || undefined,
                icon: getOptionIcon(mainText)
              });
            }
          }
        });

        if (options.length >= 2) {
          questions.push({
            question: questionLine,
            options: options,
            category: getCategoryFromQuestion(questionLine),
            helpText: generateHelpText(questionLine)
          });
        }
      });
      
      if (questions.length === 0) {
        throw new Error('No valid questions could be parsed from the questionnaire');
      }
      
      return questions;
      
    } catch (error) {
      console.error('Error parsing questionnaire:', error);
      throw error;
    }
  }, []);

  const getOptionIcon = (text: string): string => {
    const lowercaseText = text.toLowerCase();
    if (lowercaseText.includes('compact')) return '🚗';
    if (lowercaseText.includes('sedan')) return '🚙';
    if (lowercaseText.includes('suv')) return '🚘';
    if (lowercaseText.includes('van')) return '🚐';
    return '📍';
  };

  const getCategoryFromQuestion = (question: string): string => {
    const lowercaseQuestion = question.toLowerCase();
    if (lowercaseQuestion.includes('space') || lowercaseQuestion.includes('cargo')) return 'Space & Capacity';
    if (lowercaseQuestion.includes('price') || lowercaseQuestion.includes('budget')) return 'Budget';
    if (lowercaseQuestion.includes('fuel') || lowercaseQuestion.includes('efficiency')) return 'Efficiency';
    if (lowercaseQuestion.includes('safety') || lowercaseQuestion.includes('security')) return 'Safety';
    return 'General';
  };

  const generateHelpText = (question: string): string => {
    const lowercaseQuestion = question.toLowerCase();
    if (lowercaseQuestion.includes('space')) {
      return 'Consider your daily needs for passengers and cargo, including future requirements.';
    }
    if (lowercaseQuestion.includes('budget')) {
      return 'Remember to factor in maintenance, insurance, and fuel costs beyond the purchase price.';
    }
    if (lowercaseQuestion.includes('fuel')) {
      return 'Think about your typical driving patterns and local fuel prices.';
    }
    return '';
  };

  const handleOptionSelect = async (option: string) => {
    const currentQuestion = questionnaire[currentQuestionIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.question]: option
    }));

    setShowQuestion(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (currentQuestionIndex < questionnaire.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowQuestion(true);
    } else {
      generateRecommendation();
    }
  };

  const handlePrevious = async () => {
    setShowQuestion(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentQuestionIndex(prev => prev - 1);
    setShowQuestion(true);
  };

  const generateRecommendation = async () => {
    try {
      setLoadingStage('Generating primary list of candidates...');
      setIsLoading(true);

      const response = await api.post('/generate-recommendation', {
        search_query: searchQuery,
        user_preferences: userAnswers
      });

      const recommendationLines = response.data.recommendation
        .split('\n')
        .filter((line: string) => line.trim().length > 0);

      setLoadingStage('Preparing detailed comparison questions...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsLoading(false);
      setShowRankingQuestionnaire(true);
      setProducts(recommendationLines);
      setRecommendedProducts(recommendationLines);
      
    } catch (error) {
      console.error('Error generating recommendation:', error);
      setIsLoading(false);
      setError('Failed to generate recommendation. Please try again.');
    }
  };

  const handleRankingComplete = (rankedProducts: string[]) => {
    if (!rankedProducts || rankedProducts.length === 0) {
      setError('Failed to generate ranked products. Please try again.');
      return;
    }

    navigate('/results', {
      state: {
        searchQuery,
        userPreferences: userAnswers,
        recommendation: rankedProducts,
        initialAnswers: questionnaire.map(q => ({
          question: q.question,
          answer: userAnswers[q.question]
        }))
      }
    });
  };

  const handleQuestionnaireComplete = (answers: Record<string, string>) => {
    setUserAnswers(answers);
    setCurrentStage('recommendation');
  };

  const handleRecommendationComplete = (products: string[]) => {
    // Extract questions from the questionnaire
    const questions = questionnaire.map(q => q.question);
    setRecommendedProducts(products);
    setCurrentStage('ranking');
    setShowRankingQuestionnaire(true);
  };

  if (isLoading) {
    return (
      <motion.div 
        className="questionnaire-page"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <div className="questionnaire-container">
          <div className="space-background" />
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-icon">
                <div className="pulse-ring"></div>
                <span className="icon" role="img" aria-label="star">🌟</span>
              </div>
              
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {loadingStage}
              </motion.h2>

              <motion.div 
                className="loading-progress-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="loading-progress-bar">
                  <motion.div 
                    className="loading-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="loading-progress-text">
                  <span>Analyzing...</span>
                  <span>{loadingProgress}%</span>
                </div>
              </motion.div>

              <motion.div 
                className="loading-stage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    ✨ Crafting Your Stellar Experience ✨
                  </motion.span>
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (showRankingQuestionnaire && products.length > 0) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <RankingQuestionnaire
          products={products}
          searchQuery={searchQuery}
          onRankingComplete={handleRankingComplete}
          previousQuestions={questionnaire.map(q => q.question)}
        />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="questionnaire-page error"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <div className="error-container">
          <span className="error-icon" role="img" aria-label="warning">⚠️</span>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questionnaire[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.length) * 100;

  return (
    <motion.div 
      className="questionnaire-page"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="questionnaire-container">
        <div className="title-container">
          <motion.h2 
            className="main-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Personalizing recommendations for You
          </motion.h2>
        </div>
        
        <div className="progress-indicator">
          <span>Question {currentQuestionIndex + 1} of {questionnaire.length}</span>
          <span>{Math.round(progress)}% Complete</span>
          <div className="progress-line">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            className="question-section"
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            <div className="question-card">
              <div className="question-header">
                <div className="question-number">
                  <span className="current">{currentQuestionIndex + 1}</span>
                  <span className="total">/{questionnaire.length}</span>
                </div>
                {currentQuestion?.category && (
                  <span className="question-category">{currentQuestion.category}</span>
                )}
              </div>
              
              <div className="question-content">
                <h3 className="question-text">{currentQuestion.question}</h3>
                {currentQuestion.helpText && (
                  <motion.div 
                    className={`help-text ${showHelpText ? 'visible' : ''}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: showHelpText ? 1 : 0,
                      height: showHelpText ? 'auto' : 0
                    }}
                  >
                    <p>{currentQuestion.helpText}</p>
                  </motion.div>
                )}
                <button 
                  className="help-button"
                  onClick={() => setShowHelpText(!showHelpText)}
                  aria-label={showHelpText ? "Hide help text" : "Show help text"}
                >
                  {showHelpText ? '❌' : '❔'}
                </button>
              </div>
              
              <div className="options-grid">
                {currentQuestion.options.map((option, index) => {
                  const optionLabel = String.fromCharCode(65 + index);
                  const isSelected = userAnswers[currentQuestion.question] === option.text;
                  
                  return (
                    <motion.button 
                      key={index} 
                      className={`option-button ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(option.text)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="option-content">
                        <span className="option-label">{optionLabel}</span>
                        <span className="option-icon" role="img" aria-hidden="true">
                          {option.icon}
                        </span>
                        <div className="option-text-container">
                          <span className="option-text">{option.text}</span>
                          {option.description && (
                            <span className="option-description">{option.description}</span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <motion.span 
                          className="check-mark"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="navigation-buttons">
          {currentQuestionIndex > 0 && (
            <motion.button 
              className="nav-button previous"
              onClick={handlePrevious}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="button-icon">←</span>
              Previous Question
            </motion.button>
          )}
          {currentQuestionIndex < questionnaire.length - 1 && userAnswers[currentQuestion.question] && (
            <motion.button 
              className="nav-button next"
              onClick={() => handleOptionSelect(userAnswers[currentQuestion.question])}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next Question
              <span className="button-icon">→</span>
            </motion.button>
          )}
          {currentQuestionIndex === questionnaire.length - 1 && userAnswers[currentQuestion.question] && (
            <motion.button 
              className="nav-button submit"
              onClick={generateRecommendation}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Your Recommendation
              <span className="button-icon">✨</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionnairePage; 