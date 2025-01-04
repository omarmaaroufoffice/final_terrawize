// Track page views
export const trackPageView = (path: string) => {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title
    });
  }
};

// Track search events
export const trackSearch = (query: string) => {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', 'search', {
      search_term: query
    });
  }
};

// Track questionnaire answers
export const trackQuestionAnswer = (question: string, answer: string) => {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', 'question_answer', {
      question: question,
      answer: answer
    });
  }
};

// Track recommendations viewed
export const trackRecommendationView = (products: string[]) => {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', 'view_item_list', {
      items: products.map((product, index) => ({
        item_name: product,
        index: index
      }))
    });
  }
};

// Track product clicks
export const trackProductClick = (productName: string, position: number) => {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', 'select_item', {
      items: [{
        item_name: productName,
        index: position
      }]
    });
  }
};

// Track user interactions
export const trackInteraction = (action: string, category?: string, label?: string) => {
  const gtag = (window as any).gtag;
  if (gtag) {
    gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
}; 