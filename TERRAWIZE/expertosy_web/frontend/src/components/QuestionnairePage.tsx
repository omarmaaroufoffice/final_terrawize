import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { getLocationFromIP } from '../services/locationService';
import RankingQuestionnaire from './RankingQuestionnaire';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './shared/Navigation';
import './QuestionnairePage.css';

interface ProductExplanation {
  name: string;
  price: string;
  explanation: string;
  advantages: string[];
  situationalBenefits?: string;
  affiliateLink?: string;
}

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
  const [showInitialRecommendations, setShowInitialRecommendations] = useState(false);
  const [userLocation, setUserLocation] = useState<{ country: string; city: string; region: string } | null>(null);

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

  // Add location detection on component mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const locationData = await getLocationFromIP();
        setUserLocation(locationData);
      } catch (error) {
        console.error('Error detecting location:', error);
      }
    };
    detectLocation();
  }, []);

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

    return () => {
      mounted = false;
      clearInterval(progressInterval);
    };
  }, [navigate, location.state]);

  useEffect(() => {
    const state = location.state as { searchQuery?: string, factors?: string[] };
    
    const generateQuestionnaire = async () => {
      if (!searchQuery || !state?.factors) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        if (!searchQuery.trim()) {
          setError('Search query is required');
          setIsLoading(false);
          return;
        }
        
        const response = await api.post('/create-questionnaire', { 
          search_query: searchQuery.trim(),
          factors: state.factors,
          location: userLocation
        });

        if (response.data && response.data.questionnaire) {
          const parsedQuestionnaire = parseQuestionnaire(response.data.questionnaire);
          setQuestionnaire(parsedQuestionnaire);
          setShowQuestion(true);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Received invalid response format from server. Please try again.');
        }
      } catch (err) {
        console.error('Error generating questionnaire:', err);
        setError('Failed to generate questionnaire. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    generateQuestionnaire();
  }, [searchQuery, location.state, retryCount, userLocation]);

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
        user_preferences: userAnswers,
        location: userLocation
      });

      const recommendationLines = response.data.recommendation
        .split('\n')
        .filter((line: string) => line.trim().length > 0);

      // Show results immediately
      setProducts(recommendationLines);
      setRecommendedProducts(recommendationLines);
      setShowInitialRecommendations(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      setIsLoading(false);
      setError('Failed to generate recommendation. Please try again.');
    }
  };

  const handleRankingComplete = (rankedProducts: ProductExplanation[]) => {
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
        })),
        userLocation
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
        <div className="questionnaire-container loading">
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-icon">
                <div className="pulse-ring"></div>
                <span className="icon" role="img" aria-label="star">✨</span>
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
                  <span>Processing</span>
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
                    ✨ Crafting Your Perfect Match ✨
                  </motion.span>
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (showInitialRecommendations) {
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
            
          </div>
          
          <motion.button
            className="nav-button next continue-button"
            onClick={() => {
              setShowInitialRecommendations(false);
              setShowRankingQuestionnaire(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Continue to Detailed Ranking
            <span className="button-icon">→</span>
          </motion.button>

          <motion.div 
            className="recommendations-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {recommendedProducts.map((product, index) => {
              const [name, price] = product.split(' - ');
              return (
                <motion.div
                  key={index}
                  className="recommendation-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="product-name">{name}</div>
                  <div className="product-price">{price}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (showRankingQuestionnaire) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <RankingQuestionnaire
          products={recommendedProducts}
          onRankingComplete={handleRankingComplete}
          searchQuery={searchQuery}
          previousQuestions={questionnaire.map(q => q.question)}
          userLocation={userLocation || undefined}
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
    <div className="questionnaire-page">
      <Navigation />
      <div className="questionnaire-container">
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
              {currentQuestion?.category && (
                <div className="question-category">{currentQuestion.category}</div>
              )}
              <div className="question-content">
                <h2 className="question-text">{currentQuestion.question}</h2>
                {currentQuestion.helpText && currentQuestion.helpText.trim() && (
                  <div className="help-text">
                    {currentQuestion.helpText}
                  </div>
                )}
              </div>

              <div className="options-grid">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${userAnswers[currentQuestion.question] === option.text ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option.text)}
                  >
                    <div className="option-content">
                      <div className="option-label">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="option-text-container">
                        <div className="option-text">{option.text}</div>
                        {option.description && (
                          <div className="option-description">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
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
    </div>
  );
};

export default QuestionnairePage; 