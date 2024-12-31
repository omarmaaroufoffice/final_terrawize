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
  const [questionnaire, setQuestionnaire] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Analyzing products...');

  useEffect(() => {
    let mounted = true;
    
    // Simulate loading stages for better UX
    const loadingStages = [
      { text: 'Analyzing products...', duration: 1000 },
      { text: 'Identifying key differences...', duration: 1500 },
      { text: 'Creating comparison questions...', duration: 1000 },
      { text: 'Finalizing questionnaire...', duration: 500 }
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

  return (
    <div className="ranking-questionnaire">
      <div className="questionnaire-container">
        <div className="questionnaire-header">
          <h2>Help us rank these products for you</h2>
          
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
      </div>
    </div>
  );
};

export default RankingQuestionnaire; 