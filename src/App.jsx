import { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import CatCanvas from './components/CatCanvas';

const DAILY_QUOTES = [
  "Mỗi buổi sáng mang đến một hy vọng mới, một cơ hội mới để bạn tỏa sáng và sống trọn vẹn từng khoảnh khắc.",
  "Nụ cười buổi sáng giống như đóa hoa hướng dương, hãy vươn mình đón nhận năng lượng tươi mới của ngày hôm nay!",
  "Đừng vội vã. Hãy hít một hơi thật sâu, uống một ngụm trà ấm và mỉm cười chào ngày mới cùng chú mèo nhỏ!",
  "Hôm nay là trang giấy trắng tinh khôi, bạn chính là tác giả của những điều rực rỡ nhất.",
  "Vạn dặm hành trình bắt đầu từ một bước chân. Chúc bạn có một ngày tràn ngập cảm hứng và may mắn!",
  "Hãy bắt đầu ngày mới với trái tim biết ơn, bạn sẽ thấy cuộc sống ngập tràn những điều kỳ diệu.",
  "Mỗi tia nắng sớm là một lời nhắc nhở dịu dàng rằng bạn luôn có cơ hội để bắt đầu lại tốt đẹp hơn.",
  "Chúc bạn một ngày tràn đầy năng lượng tích cực, niềm vui ngập tràn và bình an trong tâm hồn.",
  "Bình minh không chỉ đánh thức vạn vật, mà còn thắp sáng những ước mơ và niềm tin trong bạn.",
  "Hãy mỉm cười với thế giới hôm nay, và thế giới sẽ dịu dàng mỉm cười lại với bạn.",
  "Một ngày mới tươi đẹp đang chờ đón. Hãy tự tin bước đi và lan tỏa năng lượng ấm áp đến mọi người.",
  "Hạnh phúc đôi khi chỉ đơn giản là được đón ánh nắng sớm và hít thở bầu không khí trong lành mát rượi.",
  "Mọi nỗ lực của bạn hôm nay đều đang âm thầm xây đắp cho một ngày mai rực rỡ và vững vàng.",
  "Chúc bạn một buổi sáng an yên, công việc hanh thông và luôn giữ được nụ cười rạng ngời trên môi."
];

export default function App() {
  const [dateString, setDateString] = useState('');
  const catCanvasRef = useRef(null);

  // Set real-time Vietnamese Date
  useEffect(() => {
    const today = new Date();
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const formatted = today.toLocaleDateString('vi-VN', dateOptions);
    setDateString(`${formatted.charAt(0).toUpperCase() + formatted.slice(1)} • Rực rỡ và may mắn`);
  }, []);

  // Automatically calculate quote of the day based on current date
  const todayQuote = useMemo(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear + (startOfYear.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  }, []);

  // Soft & elegant pastel sparkle burst via canvas-confetti
  const triggerSparkles = (clientX, clientY) => {
    const x = (clientX || window.innerWidth / 2) / window.innerWidth;
    const y = (clientY || window.innerHeight / 2) / window.innerHeight;

    // Elegant morning pastel palette (soft rose, gold, peach, cream, lavender blush)
    const pastelMorning = ['#fda4af', '#fde68a', '#fed7aa', '#fbcfe8', '#fef08a', '#ffffff'];

    // 1. Delicate Star & Circle Sparkle Burst
    confetti({
      particleCount: 20,
      spread: 75,
      startVelocity: 17,
      ticks: 90,
      gravity: 0.7,
      scalar: 0.85,
      shapes: ['star', 'circle'],
      colors: pastelMorning,
      origin: { x, y },
      disableForReducedMotion: true,
      zIndex: 999
    });

    // 2. Gentle upward micro-shimmer echo
    setTimeout(() => {
      confetti({
        particleCount: 8,
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
    <div className="relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden select-none">
      {/* Warm Ambient Sun Glow Effect */}
      <div className="sun-glow" />

      {/* 3D Cat Canvas */}
      <CatCanvas
        ref={catCanvasRef}
        onPet={(x, y) => triggerSparkles(x, y)}
      />

      {/* Main Greeting & Daily Quote */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-5 sm:px-6 pointer-events-none pt-12 sm:pt-16 md:pt-20 lg:pt-24">
        <div className="text-center pointer-events-auto">
          {/* Vietnamese Date */}
          <div className="inline-flex items-center gap-1.5 text-amber-900/85 text-xs sm:text-sm font-bold mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{dateString || "Hôm nay là một ngày tuyệt vời"}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-slate-800 tracking-tight leading-snug drop-shadow-sm px-2">
            Chào Buổi Sáng,{' '}
            <br></br>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-500 to-pink-500">
              My Babier!
            </span>
          </h2>

          {/* Automatic Daily Morning Quote - clean, minimal text */}
          <div className="mt-3 sm:mt-4 max-w-md mx-auto px-2 sm:px-4">
            <p className="text-slate-700 text-xs sm:text-sm md:text-base font-semibold leading-relaxed italic drop-shadow-sm">
              "{todayQuote}"
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full pb-4 sm:pb-6 pointer-events-none" />
    </div>
  );
}
