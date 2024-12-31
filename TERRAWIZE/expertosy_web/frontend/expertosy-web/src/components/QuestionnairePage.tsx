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
        console.log('Search Query:', state.searchQuery);
        console.log('Factors:', state.factors);

        const questionnaireResponse = await axios.post('http://localhost:5001/create-questionnaire', {
          search_query: state.searchQuery,
          factors: state.factors
        });

        console.log('Questionnaire Response:', questionnaireResponse.data);

        // Parse the questionnaire text into structured questions
        const parsedQuestionnaire = parseQuestionnaire(questionnaireResponse.data.questionnaire);
        console.log('Parsed Questionnaire:', parsedQuestionnaire);

        setQuestionnaire(parsedQuestionnaire);
        setIsLoading(false);
      } catch (error) {
        console.error('Full Error Details:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response:', error.response?.data);
          console.error('Status:', error.response?.status);
        }
        alert(`Failed to generate questionnaire: ${error instanceof Error ? error.message : 'Unknown error'}`);
        navigate('/');
      }
    };

    generateQuestionnaire();
  }, [navigate, location.state]);

  const parseQuestionnaire = (questionnaireText: string): Question[] => {
    const questions: Question[] = [];
    
    // Split the text into sections using markdown headers
    const questionSections = questionnaireText.split(/#+\s*\d+\.\s*/);
    
    // Skip the first empty section
    for (let i = 1; i < questionSections.length; i++) {
      const section = questionSections[i].trim();
      
      // Extract the question text (first line)
      const questionLines = section.split('\n');
      const questionText = questionLines[0].replace(/\*+/g, '').trim();
      
      // Extract answer options
      const options: string[] = [];
      questionLines.forEach(line => {
        const optionMatch = line.match(/^-\s*([A-D])\)\s*(.+)/);
        if (optionMatch) {
          options.push(optionMatch[2].trim());
        }
      });
      
      // Only add if we have a valid question and options
      if (questionText && options.length > 0) {
        questions.push({
          text: questionText,
          options: options
        });
      }
    }
    
    console.log('Parsed Questions:', questions);
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