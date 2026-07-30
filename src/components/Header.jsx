import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full border-b-[2px] border-white/[0.15] bg-[#0a0a0b] flex flex-col md:flex-row items-stretch z-50 shrink-0">
      <div 
        onClick={() => navigate('/')}
        className="flex-1 flex items-center px-8 py-6 md:border-r-[2px] border-white/[0.15] cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-black text-white text-4xl tracking-tighter uppercase" style={{ letterSpacing: '-0.06em' }}>
          algotrace<span className="text-amber-500">.</span>
        </span>
      </div>
      
      <div className="flex items-stretch overflow-x-auto no-scrollbar">
        {['GALLERY', 'DOCS', 'CHANGELOG'].map((link) => (
          <button 
            key={link} 
            onClick={() => navigate(`/${link.toLowerCase()}`)}
            className="px-8 py-6 border-r-[2px] border-white/[0.15] font-mono text-[13px] font-bold text-white/40 hover:text-black hover:bg-white transition-colors duration-150 uppercase tracking-widest whitespace-nowrap"
          >
            {link}
          </button>
        ))}
        <a href="https://github.com/AadiyKhan/algotrace" target="_blank" rel="noreferrer" 
          className="flex items-center gap-3 px-10 py-6 bg-amber-500 text-black font-black font-mono text-[13px] hover:bg-amber-400 transition-colors duration-150 uppercase tracking-widest whitespace-nowrap group">
          <GitBranch size={16} strokeWidth={3} className="group-hover:-rotate-12 transition-transform duration-300" /> GITHUB
        </a>
      </div>
    </nav>
  );
};

export default Header;
