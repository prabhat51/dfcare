import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, Cell, PieChart, Pie } from 'recharts';
import { Calendar, AlertTriangle, TrendingUp, Eye, Activity, Target, Clock, Camera, Zap, Footprints } from 'lucide-react';

const DiabeticFootPredictor = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState(5);
  const [patientData, setPatientData] = useState(null);
  
  // Simulated prediction data
  const ulcerationRisk = [
    { year: 1, probability: 0.15, confidence: 0.85 },
    { year: 2, probability: 0.28, confidence: 0.82 },
    { year: 3, probability: 0.45, confidence: 0.78 },
    { year: 5, probability: 0.67, confidence: 0.72 },
    { year: 10, probability: 0.82, confidence: 0.65 }
  ];
  
  const deformityProgression = [
    { year: 0, arch_height: 25, toe_angle: 10, heel_deviation: 2 },
    { year: 1, arch_height: 23, toe_angle: 12, heel_deviation: 3 },
    { year: 2, arch_height: 20, toe_angle: 15, heel_deviation: 5 },
    { year: 3, arch_height: 17, toe_angle: 18, heel_deviation: 7 },
    { year: 5, arch_height: 12, toe_angle: 25, heel_deviation: 12 },
    { year: 10, arch_height: 8, toe_angle: 35, heel_deviation: 18 }
  ];
  
  const neuropathyProgression = [
    { region: 'Toes', current: 85, year1: 78, year2: 70, year3: 60, year5: 45, year10: 25 },
    { region: 'Forefoot', current: 90, year1: 85, year2: 78, year3: 70, year5: 55, year10: 35 },
    { region: 'Midfoot', current: 95, year1: 90, year2: 85, year3: 78, year5: 65, year10: 45 },
    { region: 'Heel', current: 88, year1: 82, year2: 75, year3: 68, year5: 50, year10: 30 }
  ];
  
  const pressureHotspots = [
    { region: 'Metatarsal 1', current: 180, year1: 195, year2: 215, year3: 240, year5: 285, year10: 350 },
    { region: 'Metatarsal 2', current: 160, year1: 170, year2: 185, year3: 205, year5: 240, year10: 290 },
    { region: 'Metatarsal 3', current: 140, year1: 150, year2: 165, year3: 185, year5: 220, year10: 270 },
    { region: 'Heel', current: 120, year1: 130, year2: 145, year3: 165, year5: 195, year10: 245 }
  ];
  
  const interventionRecommendations = [
    { intervention: 'Custom Orthotics', timing: '6 months', urgency: 'High', effectiveness: 85 },
    { intervention: 'Neuropathy Management', timing: '3 months', urgency: 'Critical', effectiveness: 70 },
    { intervention: 'Pressure Offloading', timing: '2 months', urgency: 'Critical', effectiveness: 90 },
    { intervention: 'Surgical Correction', timing: '2 years', urgency: 'Medium', effectiveness: 95 },
    { intervention: 'Enhanced Monitoring', timing: 'Immediate', urgency: 'High', effectiveness: 60 }
  ];
  
  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };
  
  const getRiskColor = (probability: number) => {
    if (probability < 0.3) return '#22c55e';
    if (probability < 0.6) return '#f59e0b';
    return '#ef4444';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Diabetic Foot Predictive Analytics Dashboard
          </h1>
          <p className="text-gray-600 mb-4">
            Multi-modal AI-powered prediction system for diabetic foot complications
          </p>
          
          {/* Data Sources */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <Camera className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">5 Foot Images</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Neurotouch Data</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
              <Footprints className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-800">Pedoscan Data</span>
            </div>
          </div>
          
          {/* Time Selector */}
          <div className="flex gap-2">
            {[1, 2, 3, 5, 10].map(year => (
              <button
                key={year}
                onClick={() => setSelectedTimeframe(year)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === year
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {year} Year{year > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'ulceration', label: 'Ulceration Risk', icon: AlertTriangle },
              { id: 'deformity', label: 'Deformity Progression', icon: Activity },
              { id: 'neuropathy', label: 'Neuropathy Advancement', icon: Zap },
              { id: 'pressure', label: 'Pressure Hotspots', icon: Target },
              { id: 'interventions', label: 'Interventions', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Risk Level</span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      Moderate-High
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">5-Year Ulceration Risk</span>
                    <span className="text-2xl font-bold text-red-600">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Predicted Interventions</span>
                    <span className="text-lg font-semibold">3 Required</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Key Predictions</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">High pressure areas developing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Neuropathy progression accelerating</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Structural deformities emerging</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Ulceration Risk Tab */}
          {activeTab === 'ulceration' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Ulceration Risk Timeline</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ulcerationRisk}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    />
                    <Tooltip 
                      formatter={(value) => [`${((value as number) * 100).toFixed(1)}%`, 'Ulceration Risk']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="probability" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-red-800 font-medium">
                  ⚠️ Critical Risk Alert: 67% probability of ulceration within 5 years
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Immediate intervention recommended to reduce risk trajectory
                </p>
              </div>
            </div>
          )}
          
          {/* Deformity Progression Tab */}
          {activeTab === 'deformity' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">3D Deformity Progression</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deformityProgression}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Measurement (mm/degrees)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="arch_height" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Arch Height (mm)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="toe_angle" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Toe Angle (degrees)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="heel_deviation" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Heel Deviation (mm)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-medium">Arch Height</div>
                  <div className="text-2xl font-bold text-blue-800">↓68%</div>
                  <div className="text-sm text-blue-600">Significant flattening</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-red-600 font-medium">Toe Deformity</div>
                  <div className="text-2xl font-bold text-red-800">↑250%</div>
                  <div className="text-sm text-red-600">Severe claw toe development</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-600 font-medium">Heel Deviation</div>
                  <div className="text-2xl font-bold text-yellow-800">↑800%</div>
                  <div className="text-sm text-yellow-600">Progressive misalignment</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Neuropathy Advancement Tab */}
          {activeTab === 'neuropathy' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Sensory Loss Progression Maps</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={neuropathyProgression}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="region" 
                      label={{ value: 'Foot Regions', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Sensory Function (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Current"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="year1" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Year 1"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="year5" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Year 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="year10" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Year 10"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-800 font-medium">
                  ⚠️ Rapid neuropathy progression detected in toe region
                </p>
                <p className="text-orange-600 text-sm mt-1">
                  Expected 71% sensory loss in toes within 10 years
                </p>
              </div>
            </div>
          )}
          
          {/* Pressure Hotspots Tab */}
          {activeTab === 'pressure' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Pressure Hotspot Evolution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pressureHotspots}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="region" 
                      label={{ value: 'Foot Regions', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Pressure (kPa)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Bar dataKey="current" fill="#22c55e" name="Current" />
                    <Bar dataKey="year5" fill="#f59e0b" name="Year 5" />
                    <Bar dataKey="year10" fill="#ef4444" name="Year 10" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-red-800 font-medium">
                  🔥 Critical pressure elevation predicted in Metatarsal 1
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Pressure expected to increase by 94% over 10 years - immediate offloading required
                </p>
              </div>
            </div>
          )}
          
          {/* Interventions Tab */}
          {activeTab === 'interventions' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Optimal Intervention Timeline</h3>
              <div className="space-y-4">
                {interventionRecommendations.map((intervention, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{intervention.intervention}</h4>
                      <span className={`${getUrgencyColor(intervention.urgency)} text-white px-2 py-1 rounded-full text-xs font-medium`}>
                        {intervention.urgency}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Timing:</span>
                        <span className="ml-2 font-medium">{intervention.timing}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Effectiveness:</span>
                        <span className="ml-2 font-medium">{intervention.effectiveness}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Urgency:</span>
                        <span className="ml-2 font-medium">{intervention.urgency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  📋 Next Action Required: Schedule custom orthotics fitting within 6 months
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  This intervention has the highest immediate impact on reducing ulceration risk
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiabeticFootPredictor;
