import NavBar from "@/components/NavBar";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <main className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">About Us</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 leading-relaxed">
            We are a team of four engineering students from the University of Guelph, united by a shared commitment to sustainability and innovation. This project, our capstone initiative, was born out of our passion for developing technology that can positively impact our communities and the environment. The Smart Utilities System is designed to be an easy-to-use, AI-powered solution for monitoring water usage in households. Our goal is to help users save water, reduce costs, and make more sustainable choices effortlessly. We&apos;re excited to share this journey with you and look forward to making a difference, one drop at a time.
          </p>
        </div>
      </main>
    </div>
  );
} 