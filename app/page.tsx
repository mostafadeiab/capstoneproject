import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <main className="flex flex-col items-center justify-center px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image
              src="/water-droplet.svg"
              alt="Water droplet icon"
              width={40}
              height={40}
              className="text-primary"
            />
            <h1 className="text-4xl font-bold text-gray-800">
              Smart Utilities System TEST
            </h1>
          </div>
          <p className="text-xl text-primary italic">Save More</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Monitor and Manage Your Water Usage Smartly
          </h2>
          <p className="text-gray-600 mb-8">
            Get real-time insights into your water consumption and make informed decisions
            for a more sustainable future.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/fixtures"
              className="bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-lg transition-colors"
            >
              View Fixtures
            </Link>
            <Link
              href="/metrics"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors"
            >
              Check Metrics
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
