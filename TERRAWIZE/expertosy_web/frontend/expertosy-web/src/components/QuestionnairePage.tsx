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
  const [factors, setFactors] = useState<string[]>([]);
  const [questionnaire, setQuestionnaire] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const state = location.state as { searchQuery?: string, factors?: string[] };
    if (!state?.searchQuery || !state?.factors) {
      navigate('/');
      return;
    }

    setSearchQuery(state.searchQuery);
    setFactors(state.factors);

    const generateQuestionnaire = async () => {
      try {
        const questionnaireResponse = await axios.post('http://localhost:5000/create-questionnaire', {
          search_query: state.searchQuery,
          factors: state.factors
        });

        // Parse the questionnaire text into structured questions
        const parsedQuestionnaire = parseQuestionnaire(questionnaireResponse.data.questionnaire);
        setQuestionnaire(parsedQuestionnaire);
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating questionnaire:', error);
        alert('Failed to generate questionnaire. Please try again.');
        navigate('/');
      }
    };

    generateQuestionnaire();
  }, [navigate, location.state]);

  const parseQuestionnaire = (questionnaireText: string): Question[] => {
    const questions: Question[] = [];
    const lines = questionnaireText.split('\n');
    let currentQuestion: Question | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Q:')) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: trimmedLine.slice(2).trim(),
          options: []
        };
      } else if (currentQuestion && /^\d+\./.test(trimmedLine)) {
        currentQuestion.options.push({ text: trimmedLine.replace(/^\d+\.\s*/, '').trim() });
      }
    }

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const handleOptionSelect = (option: string) => {
    const currentQuestion = questionnaire[currentQuestionIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.question]: option
    }));

    if (currentQuestionIndex < questionnaire.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered, generate recommendation
      generateRecommendation();
    }
  };

  const generateRecommendation = async () => {
    try {
      const recommendationResponse = await axios.post('http://localhost:5000/generate-recommendation', {
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
    return <div>Loading questionnaire...</div>;
  }

  if (questionnaire.length === 0) {
    return <div>No questionnaire available</div>;
  }

  const currentQuestion = questionnaire[currentQuestionIndex];

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-container">
        <h2>Personalized Recommendation for {searchQuery}</h2>
        <div className="progress-indicator">
          Question {currentQuestionIndex + 1} of {questionnaire.length}
        </div>

        <div className="question-section">
          <h3>{currentQuestion.question}</h3>
          <div className="options-grid">
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

export default QuestionnairePage; 