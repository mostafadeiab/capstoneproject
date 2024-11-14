import NavBar from "@/components/NavBar";

export default function Mission() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <main className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Our Mission</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 leading-relaxed">
            Our mission is to empower individuals and communities to make informed decisions about water usage, helping to reduce waste and promote sustainable living. By providing real-time data and AI-driven insights, our Smart Utilities System allows users to monitor and manage water consumption with ease. We believe that technology can play a transformative role in conserving our most precious resources, and we're committed to developing innovative solutions that make water-saving both accessible and actionable.
          </p>
        </div>
      </main>
    </div>
  );
} 