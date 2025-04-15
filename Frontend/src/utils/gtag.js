export const GA_MEASUREMENT_ID = "G-4R5HYY7DTV"; // Replace with your GA4 ID

// Track page views
export const pageview = (url) => {
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Track custom events (likes, saves, etc.)
export const event = ({ action, category, label, value }) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
