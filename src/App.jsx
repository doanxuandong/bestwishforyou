import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import DogCanvas, { DOG_BREEDS } from './components/DogCanvas';

const DAILY_QUOTES = [
  "Mỗi buổi sáng mang đến một hy vọng mới, một cơ hội mới để bạn tỏa sáng và sống trọn vẹn từng khoảnh khắc.",
  "Nụ cười buổi sáng giống như đóa hoa hướng dương, hãy vươn mình đón nhận năng lượng tươi mới của ngày hôm nay!",
  "Đừng vội vã. Hãy hít một hơi thật sâu, uống một ngụm trà ấm và mỉm cười chào ngày mới cùng những chú cún đáng yêu!",
  "Hôm nay là trang giấy trắng tinh khôi, bạn chính là tác giả của những điều rực rỡ nhất.",
  "Vạn dặm hành trình bắt đầu từ một bước chân. Chúc bạn có một ngày tràn ngập cảm hứng và may mắn!",
  "Hãy bắt đầu ngày mới với trái tim biết ơn, bạn sẽ thấy cuộc sống ngập tràn những điều kỳ diệu.",
  "Mỗi tia nắng sớm là một lời nhắc nhở dịu dàng rằng bạn luôn có cơ hội để bắt đầu lại tốt đẹp hơn.",
  "Chúc bạn một ngày tràn đầy năng lượng tích cực, niềm vui ngập tràn và bình an trong tâm hồn.",
  "Bình minh không chỉ đánh thức vạn vật, mà còn thắp sáng những ước mơ và niềm tin trong bạn.",
  "Hãy mỉm cười với thế giới hôm nay, và thế giới sẽ dịu dàng mỉm cười lại với bạn.",
  "Một ngày mới tươi đẹp đang chờ đón. Hãy tự tin bước đi và lan tỏa năng lượng ấm áp đến mọi người.",
  "Hạnh phúc đôi khi chỉ đơn giản là được đón ánh nắng sớm và ngắm nhìn những người bạn nhỏ bốn chân dễ thương.",
  "Mọi nỗ lực của bạn hôm nay đều đang âm thầm xây đắp cho một ngày mai rực rỡ và vững vàng.",
  "Chúc bạn một buổi sáng an yên, công việc hanh thông và luôn giữ được nụ cười rạng ngời trên môi."
];

export default function App() {
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [dateString, setDateString] = useState('');
  const dogCanvasRef = useRef(null);

  // Set real-time Vietnamese Date
  useEffect(() => {
    const today = new Date();
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const formatted = today.toLocaleDateString('vi-VN', dateOptions);
    setDateString(`${formatted.charAt(0).toUpperCase() + formatted.slice(1)} • Rực rỡ và may mắn`);
  }, []);

  // Daily Morning Quote
  const todayQuote = useMemo(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear + (startOfYear.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  }, []);

  // Switch handlers
  const handlePrevDog = useCallback(() => {
    setCurrentDogIndex((prev) => (prev === 0 ? DOG_BREEDS.length - 1 : prev - 1));
  }, []);

  const handleNextDog = useCallback(() => {
    setCurrentDogIndex((prev) => (prev === DOG_BREEDS.length - 1 ? 0 : prev + 1));
  }, []);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevDog();
      } else if (e.key === 'ArrowRight') {
        handleNextDog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevDog, handleNextDog]);

  // Touch swipe support for switching puppies
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX > 0) {
          handlePrevDog();
        } else {
          handleNextDog();
        }
      }
    }
  };

  // Soft & elegant pastel sparkle burst via canvas-confetti
  const triggerSparkles = (clientX, clientY) => {
    const x = (clientX || window.innerWidth / 2) / window.innerWidth;
    const y = (clientY || window.innerHeight / 2) / window.innerHeight;

    const pastelMorning = ['#fda4af', '#fde68a', '#fed7aa', '#fbcfe8', '#fef08a', '#ffffff'];

    confetti({
      particleCount: 22,
      spread: 75,
      startVelocity: 18,
      ticks: 90,
      gravity: 0.7,
      scalar: 0.85,
      shapes: ['star', 'circle'],
      colors: pastelMorning,
      origin: { x, y },
      disableForReducedMotion: true,
      zIndex: 999
    });

    setTimeout(() => {
      confetti({
        particleCount: 10,
        angle: 90,
        spread: 50,
        startVelocity: 11,
        ticks: 80,
        gravity: 0.45,
        scalar: 0.65,
        shapes: ['circle'],
        colors: ['#fff1f2', '#fef9c3', '#fed7aa'],
        origin: { x, y: Math.max(0, y - 0.03) },
        disableForReducedMotion: true,
        zIndex: 999
      });
    }, 90);
  };

  return (
    <div
      className="relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Warm Ambient Sun Glow Effect */}
      <div className="sun-glow" />

      {/* 3D Dog Canvas (Three.js with 5 Distinct Breeds) */}
      <DogCanvas
        ref={dogCanvasRef}
        currentDogIndex={currentDogIndex}
        onPet={(x, y) => triggerSparkles(x, y)}
      />

      {/* Top Main Greeting & Daily Quote */}
      <header className="relative z-10 w-full max-w-xl mx-auto px-5 sm:px-6 pointer-events-none pt-8 sm:pt-10 md:pt-12">
        <div className="text-center pointer-events-auto">
          {/* Vietnamese Date */}
          <div className="inline-flex items-center gap-1.5 text-amber-900/85 text-xs sm:text-sm font-bold mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{dateString || "Hôm nay là một ngày tuyệt vời"}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-slate-800 tracking-tight leading-snug drop-shadow-sm px-2">
            Chào Buổi Sáng,{' '}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-500 to-pink-500">
              My Babier!
            </span>
          </h1>

          {/* Automatic Daily Morning Quote */}
          <div className="mt-2 sm:mt-2.5 max-w-md mx-auto px-2 sm:px-4">
            <p className="text-slate-700 text-xs sm:text-sm md:text-base font-semibold leading-relaxed italic drop-shadow-sm">
              "{todayQuote}"
            </p>
          </div>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 2 NÚT CHUYỂN ĐỔI HAI BÊN MÀN HÌNH (LEFT & RIGHT BUTTONS) */}
      {/* ==================================================== */}
      <div className="fixed inset-y-0 left-0 right-0 z-20 pointer-events-none flex items-center justify-between px-3 sm:px-6 md:px-8">
        {/* Nút Trái (Chuyển chú cún trước đó) */}
        <button
          onClick={handlePrevDog}
          aria-label="Chú cún trước đó"
          className="pointer-events-auto group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white/75 hover:bg-white/95 active:scale-90 text-amber-900 shadow-lg shadow-orange-900/10 backdrop-blur-md border border-white/90 transition-all duration-300 hover:shadow-orange-400/30 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 group-hover:-translate-x-0.5 text-amber-800" />
          <span className="sr-only">Chú cún trước đó</span>
        </button>

        {/* Nút Phải (Chuyển chú cún kế tiếp) */}
        <button
          onClick={handleNextDog}
          aria-label="Chú cún kế tiếp"
          className="pointer-events-auto group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-white/75 hover:bg-white/95 active:scale-90 text-amber-900 shadow-lg shadow-orange-900/10 backdrop-blur-md border border-white/90 transition-all duration-300 hover:shadow-orange-400/30 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 group-hover:translate-x-0.5 text-amber-800" />
          <span className="sr-only">Chú cún tiếp theo</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* 5 CHẤM CHỌN GIỐNG CÚN Ở ĐÁY TRANG (TỐI GIẢN & TINH TẾ) */}
      {/* ==================================================== */}
      <footer className="relative z-10 w-full pb-5 sm:pb-7 px-4 pointer-events-none flex flex-col items-center">
        {/* 5 Dots Indicator */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/45 backdrop-blur-md border border-white/60 shadow-sm">
          {DOG_BREEDS.map((breed, idx) => {
            const isActive = idx === currentDogIndex;
            return (
              <button
                key={breed.id}
                onClick={() => setCurrentDogIndex(idx)}
                aria-label={`Chọn cún số ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none ${
                  isActive
                    ? 'w-7 h-2.5 bg-amber-500 shadow-sm'
                    : 'w-2.5 h-2.5 bg-slate-400/40 hover:bg-slate-500/60'
                }`}
              />
            );
          })}
        </div>
      </footer>
    </div>
  );
}
