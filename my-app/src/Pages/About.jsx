import React from "react";

function About() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-700 via-green-600 to-green-500 text-white py-24 text-center px-6">
        <h1
          className="text-5xl md:text-7xl font-extrabold uppercase tracking-wider 
                     text-transparent bg-clip-text bg-gradient-to-r from-white via-green-200 to-white drop-shadow-lg"
          style={{ fontFamily: "'Russo One', sans-serif" }}
        >
          About Jersyfy
        </h1>
        <p className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-green-100 leading-relaxed">
          Jersyfy is your go-to destination for authentic football jerseys from
          around the world — where passion meets performance.  
        </p>
      </section>

      {/* About Content */}
      <section className="py-20 px-6 md:px-20 bg-white text-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-700">
            Our Story
          </h2>
          <p className="text-lg leading-relaxed text-gray-600 mb-10">
            Founded with a deep love for the beautiful game, Jersyfy was built
            to bring fans closer to their heroes. From Messi to Ronaldo, Neymar
            to Mbappé — we deliver high-quality, officially styled jerseys that
            represent your passion, pride, and loyalty to the sport.
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-700">
            What We Offer
          </h2>
          <ul className="space-y-4 text-left md:text-center text-gray-700 text-lg">
            <li>⚽ 100% authentic-design football jerseys</li>
            <li>🌍 International team & club collections</li>
            <li>👕 Wide range of sizes for every fan</li>
            <li>🚀 Fast and reliable shipping worldwide</li>
            <li>💚 Passion for football — built into every product</li>
          </ul>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-green-700 text-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Our Mission</h2>
        <p className="max-w-3xl mx-auto text-lg text-green-100 leading-relaxed">
          To empower fans across the globe to express their love for football
          through premium jerseys and merchandise that connect them to the
          spirit of the game.
        </p>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 md:px-20 bg-gray-100 text-center">
        <h2 className="text-4xl font-bold text-green-700 mb-10">Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-transform duration-300">
            <img
              src="https://i.imgur.com/yU0XJ3B.jpeg"
              alt="Founder"
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800">Alex Carter</h3>
            <p className="text-green-600 font-medium">Founder & CEO</p>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-transform duration-300">
            <img
              src="https://i.imgur.com/jxWqIBf.jpeg"
              alt="Marketing Head"
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800">Maria Lopez</h3>
            <p className="text-green-600 font-medium">Marketing Head</p>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-transform duration-300">
            <img
              src="https://i.imgur.com/mQG8fM5.jpeg"
              alt="Design Lead"
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800">Ryan Smith</h3>
            <p className="text-green-600 font-medium">Design Lead</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-800 text-center text-white py-16">
        <h2 className="text-3xl font-bold mb-4">Join the Jersyfy Community</h2>
        <p className="max-w-2xl mx-auto text-lg mb-6 text-green-100">
          Be part of the movement. Discover new collections, get exclusive
          offers, and celebrate football with us.
        </p>
        <button className="bg-white text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-transform transform hover:scale-105">
          Explore Now
        </button>
      </section>
    </div>
  );
}

export default About;
