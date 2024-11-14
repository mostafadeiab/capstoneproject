import NavBar from "@/components/NavBar";

export default function Vision() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <main className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Our Vision</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 leading-relaxed">
            Our vision is a world where every household is equipped with the tools to track and reduce water usage, fostering a culture of conservation and environmental responsibility. We aspire to see our Smart Utilities System adopted widely, driving a significant reduction in water waste and contributing to a sustainable future. Through ongoing innovation and collaboration, we aim to make water-saving an intuitive part of daily life, helping users make small changes that lead to big impacts.
          </p>
        </div>
      </main>
    </div>
  );
} 