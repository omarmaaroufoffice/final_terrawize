import TagManager from 'react-gtm-module';

// Track page views
export const trackPageView = (path: string) => {
  TagManager.dataLayer({
    dataLayer: {
      event: 'pageview',
      page: path
    }
  });
};

// Track search events
export const trackSearch = (query: string) => {
  TagManager.dataLayer({
    dataLayer: {
      event: 'search',
      searchQuery: query
    }
  });
};

// Track questionnaire answers
export const trackQuestionAnswer = (question: string, answer: string) => {
  TagManager.dataLayer({
    dataLayer: {
      event: 'questionAnswer',
      question,
      answer
    }
  });
};

// Track recommendations viewed
export const trackRecommendationView = (products: string[]) => {
  TagManager.dataLayer({
    dataLayer: {
      event: 'recommendationView',
      products
    }
  });
};

// Track product clicks
export const trackProductClick = (productName: string, position: number) => {
  TagManager.dataLayer({
    dataLayer: {
      event: 'productClick',
      productName,
      position
    }
  });
};

// Track user interactions
export const trackInteraction = (action: string, category?: string, label?: string) => {
  TagManager.dataLayer({
    dataLayer: {
      event: 'interaction',
      action,
      category,
      label
    }
  });
}; 