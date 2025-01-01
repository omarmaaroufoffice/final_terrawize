import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './RankingQuestionnaire.css';

interface RankingQuestionnaireProps {
  products: string[];
  searchQuery: string;
  onRankingComplete: (rankedProducts: string[]) => void;
}

interface Question {
  question: string;
  options: { text: string }[];
}

const RankingQuestionnaire: React.FC<RankingQuestionnaireProps> = ({
  products,
  searchQuery,
  onRankingComplete
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [questionnaire, setQuestionnaire] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showQuestion, setShowQuestion] = useState(false);

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
    
    const loadingStages = [
      { text: '✨ Analyzing your preferences...', duration: 1000 },
      { text: '🔍 Evaluating product matches...', duration: 1500 },
      { text: '⚖️ Calculating optimal rankings...', duration: 1000 },
      { text: '🎯 Fine-tuning recommendations...', duration: 1000 },
      { text: '🌟 Preparing your personalized ranking...', duration: 500 }
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
        const response = await axios.post('http://localhost:5001/generate-ranking-questionnaire', {
          products,
          search_query: searchQuery
        });

        if (!mounted) return;

        const parsedQuestionnaire = parseQuestionnaire(response.data.questionnaire);
        setQuestionnaire(parsedQuestionnaire);
        setIsLoading(false);
        setTimeout(() => setShowQuestion(true), 300);
      } catch (error) {
        console.error('Error generating ranking questionnaire:', error);
        setIsLoading(false);
      }
    };

    generateQuestionnaire();

    return () => {
      mounted = false;
      clearInterval(progressInterval);
    };
  }, [products, searchQuery]);

  const parseQuestionnaire = (text: string): Question[] => {
    const questions: Question[] = [];
    console.log('Raw questionnaire text:', text); // Debug log

    // Split by question numbers (1., 2., etc.)
    const sections = text.split(/\d+\.\s+/).filter(Boolean);
    console.log('Parsed sections:', sections); // Debug log

    sections.forEach(section => {
      // Split into lines and clean them
      const lines = section.split('\n')
        .map(line => line.trim())
        .filter(Boolean);
      
      console.log('Processing section lines:', lines); // Debug log

      // Find the question text (first line that ends with ?)
      const questionLine = lines.find(line => line.includes('?'));
      
      if (questionLine) {
        // Find options (lines starting with A), B), C), D) or A., B., C., D.)
        const options = lines
          .filter(line => /^[A-D][\.\)]/.test(line.trim()))
          .map(line => ({
            text: line.replace(/^[A-D][\.\)]\s*/, '').trim()
          }));

        console.log('Found question:', questionLine); // Debug log
        console.log('Found options:', options); // Debug log

        if (options.length === 4) {
          questions.push({
            question: questionLine.trim(),
            options
          });
        }
      }
    });

    console.log('Final parsed questions:', questions); // Debug log
    return questions;
  };

  const handleOptionSelect = async (option: string) => {
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
        submitRankingPreferences();
      }
    }, 300);
  };

  const submitRankingPreferences = async () => {
    try {
      const response = await axios.post('http://localhost:5001/rank-products', {
        products,
        ranking_preferences: userAnswers,
        search_query: searchQuery
      });

      onRankingComplete(response.data.ranked_products);
    } catch (error) {
      console.error('Error ranking products:', error);
    }
  };

  const renderProductCard = (product: string, index: number) => {
    const [name, price] = product.split(' - ');
    const number = name.split('.')[0];
    const productName = name.split('.')[1].trim();
    const rotation = Math.random() * 6 - 3;

    return (
      <div 
        className="product-card"
        style={{ '--rotation': `${rotation}deg` } as any}
      >
        <div className="product-number">{number}</div>
        <h3 className="product-name">{productName}</h3>
        <div className="product-price">{price}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <motion.div 
        className="ranking-questionnaire"
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
                    ✨ Crafting Your Perfect Ranking ✨
                  </motion.span>
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (questionnaire.length === 0) {
    return (
      <motion.div 
        className="ranking-questionnaire"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <div className="questionnaire-container">
          <div className="error-container">
            <motion.span 
              className="error-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              ⚠️
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Could not generate ranking questions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              We couldn't create comparison questions for these products.
            </motion.p>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questionnaire[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.length) * 100;
  const remainingQuestions = questionnaire.length - (currentQuestionIndex + 1);

  return (
    <motion.div 
      className="ranking-questionnaire"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="space-stars" />
      <div className="products-background">
        <div className="products-grid left">
          {products.slice(0, 5).map((product, index) => (
            <div key={`left-${index}`}>
              {renderProductCard(product, index)}
            </div>
          ))}
        </div>
        <div className="products-grid right">
          {products.slice(5).map((product, index) => (
            <div key={`right-${index}`}>
              {renderProductCard(product, index + 5)}
            </div>
          ))}
        </div>
      </div>

      <div className="questionnaire-container">
        <motion.div 
          className="questionnaire-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Help us rank these products for you</h2>
          <motion.p 
            className={`remaining-questions ${remainingQuestions === 0 ? 'final-question' : ''}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {remainingQuestions === 0 
              ? "Last question to get your final ranking! 🚀" 
              : `${remainingQuestions} question${remainingQuestions === 1 ? '' : 's'} left to get your final ranking`
            }
          </motion.p>
          
          <div className="progress-container">
            <div className="progress-text">
              <span>Question {currentQuestionIndex + 1} of {questionnaire.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            className={`question-container ${showQuestion ? 'show' : ''}`}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            <div className="question-number">
              Question {currentQuestionIndex + 1}
            </div>
            <h3 className="question-text">{currentQuestion.question}</h3>
            
            <div className="options-container">
              {currentQuestion.options.map((option, index) => {
                const isSelected = userAnswers[currentQuestion.question] === option.text;
                const optionLabel = String.fromCharCode(65 + index);
                
                return (
                  <motion.button
                    key={index}
                    className={`option-button ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option.text)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="option-label">{optionLabel}</span>
                    {option.text}
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
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RankingQuestionnaire; 