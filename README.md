# Diabetic Foot Predictive Analytics Dashboard

A comprehensive multi-modal AI-powered prediction system for diabetic foot complications, built with React and TypeScript.

## Features

- **Multi-modal Data Integration**: Combines foot images, Neurotouch data, and Pedoscan measurements
- **Predictive Analytics**: Advanced risk assessment for ulceration, deformity progression, and neuropathy
- **Interactive Dashboard**: Real-time visualization of patient data and predictions
- **Intervention Recommendations**: Optimal timing and effectiveness of medical interventions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/diabetic-foot-predictor.git
cd diabetic-foot-predictor
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run eject`: Ejects from Create React App (one-way operation)

## Project Structure

```
diabetic-foot-predictor/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   └── DiabeticFootPredictor.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

## Key Components

### DiabeticFootPredictor
The main dashboard component featuring:
- Overview of risk assessment
- Ulceration risk timeline
- Deformity progression tracking
- Neuropathy advancement maps
- Pressure hotspot analysis
- Intervention recommendations

### Data Models
- **Ulceration Risk**: Probability calculations over time
- **Deformity Progression**: 3D measurements and predictions
- **Neuropathy Data**: Sensory function mapping
- **Pressure Analysis**: Hotspot identification and tracking

## Deployment

### GitHub Pages

1. Install the GitHub Pages package:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
{
  "homepage": "https://yourusername.github.io/diabetic-foot-predictor",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

### Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `build` folder to [Netlify](https://www.netlify.com/)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Medical Disclaimer

This application is for educational and research purposes only. It is not intended for clinical diagnosis or treatment decisions. Always consult with qualified healthcare professionals for medical advice.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Built with React and modern web technologies
- Uses Recharts for data visualization
- Styled with Tailwind CSS
- Icons by Lucide React
