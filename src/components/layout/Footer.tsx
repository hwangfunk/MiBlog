export const Footer = () => {
  return (
    <footer className="w-full mt-auto py-8 mb-4">
      <div className="flex justify-center items-center gap-8 text-neutral-500">
        <a 
          href="https://github.com/qanx-minhhh" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-cyan-400 hover:-translate-y-1 transition-all duration-300"
          aria-label="GitHub"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7.1a5.8 5.8 0 0 0-1.6-4.03 5.5 5.5 0 0 0-.15-3.97s-1.28-.4-4 1.4a13.2 13.2 0 0 0-7 0C6.28 1.03 5 1.4 5 1.4a5.5 5.5 0 0 0-.15 3.97A5.8 5.8 0 0 0 3 9.37c0 5.7 3.35 6.7 6.5 7.1a4.8 4.8 0 0 0-1 3.03v4"/>
            <path d="M9 20c-5 1.5-5-2.5-7-3"/>
          </svg>
        </a>
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-pink-500 hover:-translate-y-1 transition-all duration-300"
          aria-label="Instagram"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
        </a>
        <a 
          href="https://facebook.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-500 hover:-translate-y-1 transition-all duration-300"
          aria-label="Facebook"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
      </div>
    </footer>
  );
};
