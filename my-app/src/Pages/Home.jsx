

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 

function Home() {
  const navigate = useNavigate();


  const backgrounds = [
    "https://i2f9m2t2.rocketcdn.me/wp-content/uploads/2020/01/Singapore-Liverpool-FC-Store-Club-Jerseys-1024x564.jpg",
    "https://www.fcbarcelona.com/fcbarcelona/photo/2022/12/18/fc146e94-d4e6-4cdf-9405-80e3f7817f7d/1450108295.jpg",
     "https://wallpapercave.com/wp/wp9354262.jpg",
    "https://wallpapercave.com/wp/wp12565292.jpg",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % backgrounds.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center transition-all duration-1000 ease-in-out overflow-hidden"
      style={{
        backgroundImage: `url('${backgrounds[current]}')`,
      }}
    >
      
      <div className="absolute inset-0 bg-black/60 transition-opacity duration-1000"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 text-white">
   
           
           <h1
  className="text-7xl md:text-9xl font-bold uppercase tracking-wide 
             text-transparent bg-clip-text bg-gradient-to-r 
             from-blue-400 via-white to-blue-600 drop-shadow-lg"
  style={{ fontFamily: "'Oswald', sans-serif" }}
>
  Jerseyfy
</h1>

        <p className="mt-4 text-lg md:text-2xl text-gray-200 max-w-2xl">
          At Jerseyfy, football meets fashion. Explore exclusive collections inspired by the world’s greatest players.
        </p>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
        
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300"
          >
            Explore Collections
          </button>
        </div>
      </div>

      {/* Background indicator dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {backgrounds.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === current ? "bg-blue-500" : "bg-gray-400"
            } transition-all duration-500`}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default Home;



