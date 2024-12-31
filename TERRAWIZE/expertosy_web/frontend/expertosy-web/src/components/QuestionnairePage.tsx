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

  useEffect(() => {
    const state = location.state as { searchQuery?: string, factors?: string[] };
    if (!state?.searchQuery || !state?.factors) {
      navigate('/');
      return;
    }

    setSearchQuery(state.searchQuery);

    const generateQuestionnaire = async () => {
      try {
        console.log('Search Query:', state.searchQuery);
        console.log('Factors:', state.factors);

        const questionnaireResponse = await axios.post('http://localhost:5001/create-questionnaire', {
          search_query: state.searchQuery,
          factors: state.factors
        }, {
          timeout: 30000 // 30 seconds timeout
        });

        console.log('Questionnaire Response:', questionnaireResponse.data);

        // Parse the questionnaire text into structured questions
        const parsedQuestionnaire = parseQuestionnaire(questionnaireResponse.data.questionnaire);
        console.log('Parsed Questionnaire:', parsedQuestionnaire);

        if (parsedQuestionnaire.length === 0) {
          throw new Error('No questions were parsed from the response');
        }

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
    console.log('Raw questionnaire text:', questionnaireText);
    const questions: Question[] = [];
    
    // Remove the introduction and thank you sections
    const mainContent = questionnaireText
      .replace(/###[^#]*?\n/, '') // Remove first header
      .replace(/###\s*Thank you.*$/s, ''); // Remove thank you section
    
    // Split into question blocks using various formats
    const questionBlocks = mainContent.split(/(?:####|\*\*)\s*\d+[\.)]/);
    
    // Process each question block
    questionBlocks.forEach((block, index) => {
      if (!block.trim()) return;
      
      console.log(`Processing block ${index}:`, block);
      
      // Split block into lines and clean them
      const lines = block
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.match(/^[-\*]$/));
      
      if (lines.length === 0) return;
      
      // Find the question line
      const questionLine = lines.find(line => 
        line.includes('?') || 
        line.toLowerCase().includes('what') || 
        line.toLowerCase().includes('how') ||
        line.toLowerCase().includes('which')
      );
      
      if (!questionLine) return;
      
      const questionText = questionLine
        .replace(/\*\*/g, '')
        .replace(/^[QWHw]hat\s|^How\s|^Which\s/, '')
        .trim();
      
      console.log('Question text:', questionText);
      
      // Find the options that belong to this question
      const options: QuestionOption[] = [];
      let currentOptionLetter = '';
      
      lines.forEach(line => {
        // Match option headers (A, B, C, D)
        const optionMatch = line.match(/^(?:[-\s]*)?([A-D])[\).]\s*(.+)/);
        if (optionMatch) {
          currentOptionLetter = optionMatch[1];
          const optionText = optionMatch[2].trim();
          console.log('Found option:', optionText);
          options.push({ text: optionText });
        }
      });
      
      // Only add if we have a valid question and 2-4 options
      if (questionText && options.length >= 2 && options.length <= 4) {
        questions.push({
          question: questionText,
          options: options
        });
        console.log(`Added question with ${options.length} options`);
      }
    });
    
    console.log('Final parsed questions:', questions);
    if (questions.length === 0) {
      console.error('No questions were parsed. Raw text:', questionnaireText);
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
        
        <div className="progress-container">
          <div className="progress-text">
            <span>Question {currentQuestionIndex + 1} of {questionnaire.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questionnaire.length) * 100)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / questionnaire.length) * 100}%` }}
            />
          </div>
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