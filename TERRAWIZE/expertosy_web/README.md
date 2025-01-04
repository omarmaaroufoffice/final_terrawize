# Expertosy Web Recommendation System 🚀

## Overview

Expertosy is an advanced, AI-powered web application that generates personalized recommendations for various products and services. Leveraging OpenAI's language models, the system creates dynamic questionnaires and provides tailored recommendations based on user preferences.

## Features

- 🤖 **AI-Powered Recommendation Engine**
  - Dynamically generates factors and questionnaires
  - Uses OpenAI's GPT models for intelligent recommendations

- 🌐 **Web-Based Interface**
  - Intuitive, responsive design
  - Mobile-friendly user experience

- 💡 **Personalized Recommendations**
  - Customized recommendations based on user input
  - Detailed explanations for each recommendation

- 📊 **Comprehensive Analysis**
  - Cost breakdown integration
  - Multiple factor evaluation

## Technology Stack

### Backend
- Python
- Flask
- OpenAI API
- Gunicorn

### Frontend
- React
- TypeScript
- Axios
- React Router

### Deployment
- Docker
- Docker Compose
- Nginx

## Prerequisites

- Python 3.9+
- Node.js 18+
- Docker (optional)
- OpenAI API Key

## Local Development Setup

### Backend Setup

1. Navigate to the backend directory
```bash
cd backend
```

2. Create a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your OpenAI API key
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

5. Run the Flask application
```bash
flask run
```

### Frontend Setup

1. Navigate to the frontend directory
```bash
cd frontend/expertosy-web
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

## Docker Deployment

1. Ensure you have Docker and Docker Compose installed

2. Set your OpenAI API key in the environment
```bash
export OPENAI_API_KEY=your_openai_api_key
```

3. Build and run the application
```bash
cd deployment
docker-compose up --build
```

## Environment Variables

### Backend (`.env`)
- `OPENAI_API_KEY`: Your OpenAI API key
- `FLASK_ENV`: Development or production environment
- `SECRET_KEY`: Flask secret key

### Frontend
- `REACT_APP_BACKEND_URL`: URL of the backend service

## Security

- API keys are managed through environment variables
- CORS is configured to restrict access
- Nginx provides additional security headers

## Roadmap and Future Enhancements

- [ ] User authentication
- [ ] Persistent user preferences
- [ ] More advanced recommendation algorithms
- [ ] Expanded product categories
- [ ] Analytics dashboard

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open-source. See the LICENSE file for details.

## Contact

Omar Maarouf - [Your Email/LinkedIn]

Powered by OpenAI and built with ❤️ by the Expertosy Team 