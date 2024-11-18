import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function Home() {
  const metrics = [
    {
      title: "Flow Rates",
      description: "Standard vs High-Efficiency Fixtures",
      items: [
        {
          name: "Toilet",
          standard: "6.0 Lpf",
          efficient: "4.8 Lpf",
          icon: "/fixtures/toilet.svg",
          color: "bg-blue-50"
        },
        {
          name: "Shower",
          standard: "9.5 L/min",
          efficient: "7.6 L/min",
          icon: "/fixtures/shower.svg",
          color: "bg-green-50"
        },
        {
          name: "Bathroom Sink",
          standard: "5.7 L/min",
          efficient: "5.7 L/min",
          icon: "/fixtures/bathroom-sink.svg",
          color: "bg-purple-50"
        },
        {
          name: "Kitchen Sink",
          standard: "8.3 L/min",
          efficient: "8.3 L/min",
          icon: "/fixtures/kitchen-sink.svg",
          color: "bg-yellow-50"
        },
        {
          name: "Washing Machine",
          standard: "100 L/load",
          efficient: "50 L/load",
          icon: "/fixtures/washing-machine.svg",
          color: "bg-red-50"
        },
        {
          name: "Dishwasher",
          standard: "20 L/cycle",
          efficient: "15 L/cycle",
          icon: "/fixtures/dishwasher.svg",
          color: "bg-indigo-50"
        }
      ]
    },
    {
      title: "Usage Patterns",
      description: "Average Duration & Frequency",
      items: [
        {
          name: "Shower",
          duration: "8 ± 3 min",
          frequency: "0.75× per person/day",
          icon: "/fixtures/shower.svg",
          color: "bg-green-50"
        },
        {
          name: "Bathroom Sink",
          duration: "15 ± 5 sec",
          frequency: "8× per person/day",
          icon: "/fixtures/bathroom-sink.svg",
          color: "bg-purple-50"
        },
        {
          name: "Kitchen Sink",
          duration: "2 ± 1 min",
          frequency: "3× per household/day",
          icon: "/fixtures/kitchen-sink.svg",
          color: "bg-yellow-50"
        },
        {
          name: "Toilet",
          duration: "Instant",
          frequency: "5× per person/day",
          icon: "/fixtures/toilet.svg",
          color: "bg-blue-50"
        },
        {
          name: "Washing Machine",
          duration: "60 ± 15 min",
          frequency: "As needed",
          icon: "/fixtures/washing-machine.svg",
          color: "bg-red-50"
        },
        {
          name: "Dishwasher",
          duration: "120 ± 30 min",
          frequency: "As needed",
          icon: "/fixtures/dishwasher.svg",
          color: "bg-indigo-50"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-8 py-16">
        {/* Hero Section with Buttons */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/water-droplet.svg"
              alt="Water droplet icon"
              width={48}
              height={48}
              className="text-primary"
            />
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Smart Utilities System
            </h1>
          </div>
          <p className="text-xl text-gray-600 italic mb-8">
            Monitor, Analyze, Save
          </p>
          
          {/* Moved Call to Action Buttons here */}
          <div className="flex gap-4 justify-center mb-12">
            <Link 
              href="/fixtures"
              className="bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-lg transition-all hover:scale-105 shadow-lg"
            >
              View Your Fixtures
            </Link>
            <Link
              href="/metrics"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg transition-all hover:scale-105 shadow-lg"
            >
              Check Your Metrics
            </Link>
          </div>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Understanding your household water consumption is the first step towards conservation.
            Here&apos;s what typical water usage looks like for a 3-person household:
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-16">
          {metrics.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                <p className="text-gray-600">{section.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className={`${item.color} rounded-lg p-6 transition-transform hover:scale-105`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative flex-shrink-0">
                        <Image
                          src={item.icon}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    </div>
                    {'standard' in item ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Standard:</span>
                          <span className="font-medium text-gray-800">{item.standard}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Efficient:</span>
                          <span className="font-medium text-primary">{item.efficient}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-800">{item.duration}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Frequency:</span>
                          <span className="font-medium text-primary">{item.frequency}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
