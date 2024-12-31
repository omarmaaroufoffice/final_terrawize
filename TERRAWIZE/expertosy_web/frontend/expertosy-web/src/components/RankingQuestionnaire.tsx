import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    let mounted = true;
    
    // Enhanced loading stages for better UX
    const loadingStages = [
      { text: 'Analyzing product specifications...', duration: 1000 },
      { text: 'Comparing key features...', duration: 1000 },
      { text: 'Identifying important trade-offs...', duration: 1000 },
      { text: `Preparing ${products.length} questions for final ranking...`, duration: 1000 },
      { text: 'Finalizing comparison criteria...', duration: 500 }
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

    return (
      <div 
        className="product-card"
        style={{
          animationDelay: `${index * 0.1}s`,
          transform: `rotate(${Math.random() * 10 - 5}deg)`
        }}
      >
        <div className="product-number">{number}</div>
        <h3 className="product-name">{productName}</h3>
        <div className="product-price">{price}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="ranking-questionnaire loading">
        <div className="loading-container" data-testid="loading-indicator">
          <div className="loading-spinner"></div>
          <div className="loading-stage">
            <div className="loading-progress-bar">
              <div className="progress" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p>{loadingStage}</p>
          </div>
        </div>
      </div>
    );
  }

  if (questionnaire.length === 0) {
    return (
      <div className="ranking-questionnaire error">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <h2>Could not generate ranking questions</h2>
          <p>We couldn't create comparison questions for these products.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questionnaire[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.length) * 100;
  const remainingQuestions = questionnaire.length - (currentQuestionIndex + 1);

  return (
    <div className="ranking-questionnaire">
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
        <div className="questionnaire-header">
          <h2>Help us rank these products for you</h2>
          <p className="remaining-questions">
            {remainingQuestions === 0 
              ? "Last question to get your final ranking!" 
              : `${remainingQuestions} question${remainingQuestions === 1 ? '' : 's'} left to get your final ranking`
            }
          </p>
          
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

        <div className={`question-container ${showQuestion ? 'show' : ''}`}>
          <div className="question-number">Question {currentQuestionIndex + 1}</div>
          <h3 className="question-text">{currentQuestion.question}</h3>
          
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className="option-button"
                onClick={() => handleOptionSelect(option.text)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingQuestionnaire; 