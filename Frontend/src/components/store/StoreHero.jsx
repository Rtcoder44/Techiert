import React from 'react';
import { FaSearch } from 'react-icons/fa';

const StoreHero = ({ searchValue, onSearchChange }) => {
  const fullTitle = "Your Tech Shopping Destination";
  const [typedTitle, setTypedTitle] = React.useState("");

  React.useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTypedTitle(fullTitle.slice(0, i));
      if (i >= fullTitle.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[520px] overflow-hidden">
      {/* Animated background with repeating TECHIERT text */}
      <div className="absolute inset-0 bg-neutral-900"> 
        {/* moving gradient blobs */}
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-gradient-to-tr from-blue-500/40 to-fuchsia-500/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-gradient-to-tr from-amber-500/30 to-rose-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay:'0.8s'}} />
        {/* scrolling marquee of brand text */}
        <div className="absolute inset-0 opacity-15 select-none" aria-hidden>
          {[...Array(6)].map((_, row) => (
            <div key={row} className={`whitespace-nowrap text-[72px] font-extrabold tracking-tight text-white/5 animate-marquee ${row%2===0 ? '' : 'animate-marquee2'}`} style={{top: `${row*16}%`, position:'absolute'}}>
              {Array.from({length:8}).map((__,i)=> (
                <span key={i} className="mx-6">TECHIERT</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Foreground content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-white max-w-4xl">
          <h1 className="text-5xl sm:text-[56px] font-extrabold mb-5 leading-tight">
            <span className="bg-gradient-to-r from-amber-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent drop-shadow-sm">
              {typedTitle}
            </span>
            <span className={`inline-block w-1 align-middle ml-1 bg-white h-10 sm:h-[48px] translate-y-1 blinking-caret ${typedTitle.length === fullTitle.length ? 'opacity-0' : ''}`}></span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200/90 mb-7 font-medium">
            "Where innovation meets your cart – discover, compare and buy the best gear."
          </p>
          <div className="max-w-xl relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 focus:ring-2 focus:ring-amber-400 focus:outline-none text-lg shadow-lg"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHero; 