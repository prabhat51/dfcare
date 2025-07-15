const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface PredictionRequest {
  patient_id?: string;
  neurotouch?: {
    monofilament?: {
      risk_score: number;
      tactile_sensation: number;
      affected_points: string[];
    };
    vibration?: {
      risk_score: number;
      threshold: number;
      affected_points: string[];
    };
    hot_perception?: {
      risk_score: number;
      threshold: number;
    };
    cold_perception?: {
      risk_score: number;
      threshold: number;
    };
  };
  pedoscan?: {
    pressure_matrix: number[][];
  };
  foot_images?: string[];
  arterial?: {
    abi?: {
      right: number;
      left: number;
    };
    tbi?: {
      right: number;
      left: number;
    };
    pressures?: {
      arm_right: number;
      arm_left: number;
      ankle_right: number;
      ankle_left: number;
      toe_right: number;
      toe_left: number;
    };
  };
}

export interface PredictionResponse {
  patient_id?: string;
  timestamp: string;
  risk_assessment: {
    current_ulceration_risk: number;
    risk_level: string;
    confidence: number;
  };
  feature_analysis: {
    neurotouch_score: number;
    pressure_analysis: {
      max_pressure: number;
      high_pressure_percentage: number;
    };
    vascular_analysis: {
      abi_average: number;
      tbi_average: number;
      vascular_risk_score: number;
    };
  };
  progression_predictions: {
    [key: string]: {
      ulceration_risk: number;
      neuropathy_decline: number;
      pressure_increase: number;
      deformity_progression: number;
    };
  };
  recommendations: Array<{
    intervention: string;
    timing: string;
    urgency: string;
    effectiveness: number;
    description: string;
  }>;
}

class ApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetchApi('/health');
  }

  async predict(data: PredictionRequest): Promise<PredictionResponse> {
    return this.fetchApi('/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDataFormat(): Promise<any> {
    return this.fetchApi('/data-format');
  }

  // Helper method to convert file to base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Helper method to process multiple images
  async processImages(files: FileList): Promise<string[]> {
    const promises = Array.from(files).map(file => this.fileToBase64(file));
    return Promise.all(promises);
  }
}

export const apiService = new ApiService();
export default apiService;
