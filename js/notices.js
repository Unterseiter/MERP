const BuildNotices = () => {
    const NOTICE_TEXT = 'Пробный период окончен';
    const NOTICE_DELAY = 1000;
  
    const showNotice = () => {
      const notice = document.createElement('div');
      notice.className = 'custom-notice';
      notice.textContent = NOTICE_TEXT;
      document.body.appendChild(notice);
      
      setTimeout(() => notice.remove(), 3000);
    };
  
    const init = () => {
      const button = document.getElementById('notices-btn');
      if (button) {
        button.addEventListener('click', () => {
          setTimeout(showNotice, NOTICE_DELAY);
        });
      }
    };
  
    return { init };
  };
  
  module.exports = BuildNotices;