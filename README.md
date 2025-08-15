# Chicken Feed Calculator

## Rearing Styles

Rearing styles are restricted to two options:
- backyard
- commercial

Validation is enforced in [shared/utils/errorHandling.js](shared/utils/errorHandling.js:124). Any other value (e.g., free-range, organic) will throw a validation error.

UI pickers in both web and mobile expose only these two options.

## Progressive Feeding (Broilers)

Progressive daily feeding is enforced for broilers across layers to align with performance and accuracy goals. Callers do not need to toggle this; it is applied by default in shared logic and explicitly enforced in mobile logic.
- Shared logic uses progressive feeding by default within [shared/utils/feedCalculator.js](shared/utils/feedCalculator.js:523).
- Mobile logic unconditionally applies progressive feeding for broilers in [mobile/lib/feedCalculator.js](mobile/lib/feedCalculator.js:196).

## Centralized Pricing Configuration

Feed pricing is centrally managed in [shared/utils/pricingConfig.js](shared/utils/pricingConfig.js:1). Use:
- FEED_PRICES for current bag prices and sizes
- getPricePerKg(feedType) to compute current price per kg
- updateFeedPrice(feedType, { pricePerBag, bagSizeKg }) to adjust runtime pricing (e.g., via admin tools)

Costing integrates pricingConfig in [shared/utils/feedCalculator.js](shared/utils/feedCalculator.js:939).

Example:
```js
import { updateFeedPrice } from '../shared/utils/pricingConfig.js';

updateFeedPrice('starter', { pricePerBag: 26000 });
// Subsequent calls to calculateFeedCost reflect updated price.
```

## Testing

Jest is configured at the repo root with Babel transform for ESM syntax in source.
- Config: [jest.config.js](jest.config.js:1)
- Scripts: see [package.json](package.json:10) ("test", "test:watch")
- Tests located under ./tests

Run:
```bash
npm install
npm test
```

🐔 **Smart poultry feed management system for African farmers**

A comprehensive cross-platform application designed to help poultry farmers optimize their feed management, reduce costs, and improve bird health through intelligent calculations and expert guidance.

## 🌟 Features

### 📊 Smart Feed Calculator
- **Precise Calculations**: Calculate exact feed requirements based on bird type, breed, age, and target weight
- **Multiple Bird Types**: Support for broilers and layers with breed-specific calculations
- **Growth Tracking**: Monitor feed requirements as birds grow
- **Cost Optimization**: Compare different feeding strategies

### 🛒 Feed Recommendations
- **Commercial Feeds**: Curated database of Nigerian and African feed brands
- **Local Mix Recipes**: Cost-effective homemade feed formulations
- **Price Comparisons**: Real-time pricing information and cost analysis
- **Nutritional Information**: Detailed protein, calcium, and energy content

### 📚 Knowledge Center
- **Weekly Tips**: 52 weeks of expert poultry management advice
- **Seasonal Guidance**: Weather-specific farming recommendations
- **Emergency Signs**: Quick reference for health issues and immediate actions
- **Favorites System**: Save important tips for quick access

### 📱 Cross-Platform Support
- **Web Application**: Responsive design for desktop and mobile browsers
- **Mobile App**: Native iOS and Android experience with offline support
- **Progressive Web App**: Install on any device for app-like experience

### ☁️ Cloud Integration (Optional)
- **User Accounts**: Sign up and sync data across devices
- **Data Backup**: Automatic cloud backup of calculations and preferences
- **Multi-Device Access**: Access your data from any device
- **Offline Support**: Works offline with sync when connected
- **Data Migration**: Seamless migration from local storage to cloud

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- For mobile development: Expo CLI
- Optional: Firebase account for cloud features ([firebase.google.com](https://firebase.google.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chickenfeedcalc/app.git
   cd chicken-feed-calculator
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment (optional)**
   
   For cloud features, create `web/.env.local`:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password
    ```
    
    See Firebase documentation for detailed setup.

4. **Start development servers**
   
   **Web Application:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser
   
   **Mobile Application:**
   ```bash
   npm run mobile:start
   ```
   Use Expo Go app to scan the QR code

## 📁 Project Structure

```
chicken-feed-calculator/
├── web/                    # Next.js web application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and stores
│   └── package.json
├── mobile/                # React Native mobile app
│   ├── app/              # Expo router pages
│   ├── components/       # React Native components
│   ├── lib/             # Utilities and stores
│   └── package.json
├── shared/               # Shared business logic
│   ├── data/            # Feed brands and knowledge data
│   └── utils/           # Calculation algorithms
└── package.json         # Root package configuration
```

## 🛠️ Development

### Available Scripts

**Root Level:**
- `npm run dev` - Start web development server
- `npm run build` - Build web application for production
- `npm run mobile:start` - Start mobile development server
- `npm run mobile:android` - Run on Android device/emulator
- `npm run mobile:ios` - Run on iOS device/simulator
- `npm run lint` - Run linting for both web and mobile
- `npm run test` - Run tests for both platforms
- `npm run clean` - Clean all node_modules and build artifacts

**Web Application:**
```bash
cd web
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

**Mobile Application:**
```bash
cd mobile
npm start            # Start Expo development server
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run web          # Run in web browser
```

### Technology Stack

**Web Application:**
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Custom components with Tailwind
- **Icons**: Lucide React

**Mobile Application:**
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind for React Native)
- **State Management**: Zustand with AsyncStorage
- **UI Components**: React Native Paper + Custom components
- **Icons**: Expo Vector Icons

**Shared:**
- **Language**: JavaScript
- **Package Manager**: npm with workspaces
- **Code Quality**: ESLint, Prettier

## 🎯 Target Users

### 🏠 Backyard Farmers
- Managing small flocks (≤10 birds)
- Family consumption or local sales
- Cost-conscious approach
- Need simple, reliable guidance

### 🏭 Commercial Farmers
- Operating larger operations (>10 birds)
- Focus on efficiency and profitability
- Require detailed analytics
- Scale-dependent calculations

### 🌱 New Farmers
- Starting their poultry journey
- Need comprehensive guidance
- Learning best practices
- Building confidence

### 👨‍🌾 Agricultural Extension Workers
- Supporting multiple farmers
- Providing technical assistance
- Training and education
- Data collection and analysis

## 🌍 Localization

### Supported Regions
- **Nigeria**: Primary focus with local feed brands and pricing
- **Ghana**: Regional feed options and market data
- **Kenya**: East African market considerations
- **Generic**: Adaptable for other African countries

### Currency Support
- Nigerian Naira (₦) - Primary
- US Dollar ($)
- Euro (€)
- British Pound (£)

### Language Support
- **English**: Fully supported
- **Yoruba**: Coming soon
- **Hausa**: Coming soon
- **Igbo**: Coming soon

## 📊 Feed Calculation Methodology

### Broiler Calculations
- **Starter Phase** (0-28 days): High protein for rapid growth
- **Grower Phase** (29-42 days): Balanced nutrition for development
- **Finisher Phase** (43+ days): Optimized for weight gain

### Layer Calculations
- **Starter Phase** (0-28 days): Foundation for healthy development
- **Grower Phase** (29-125 days): Preparing for egg production
- **Layer Phase** (126+ days): Optimized for egg production

### Factors Considered
- Bird type and breed
- Current age and target weight
- Rearing style (intensive, semi-intensive, extensive)
- Environmental conditions
- Feed conversion ratios
- Nutritional requirements by phase

## 🔧 Configuration

### Environment Variables

**Web Application (.env.local):**
```env
NEXT_PUBLIC_APP_NAME="Chicken Feed Calculator"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_API_URL="https://api.chickenfeedcalc.com"
```

**Mobile Application:**
Configuration is handled through `app.json` and Expo configuration.

## 🚀 Deployment

### Web Application

**Vercel (Recommended):**
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `web/.next`
4. Deploy automatically on push

**Manual Deployment:**
```bash
cd web
npm run build
npm run start
```

### Mobile Application

**Expo Application Services (EAS):**
```bash
cd mobile
npm install -g @expo/cli
eas build --platform all
eas submit --platform all
```

**Development Build:**
```bash
cd mobile
eas build --profile development
```

## 🧪 Testing

### Running Tests
```bash
# All tests
npm run test

# Web tests only
cd web && npm run test

# Mobile tests only
cd mobile && npm run test
```

### Test Coverage
- Unit tests for calculation algorithms
- Component testing for UI elements
- Integration tests for data flow
- E2E tests for critical user journeys

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Agricultural extension workers and veterinarians for expert guidance
- Nigerian poultry farmers for real-world feedback and testing
- Open source community for excellent tools and libraries
- Research institutions for feed calculation methodologies

## 📞 Support

- **Email**: support@chickenfeedcalc.com
- **GitHub Issues**: [Report bugs or request features](https://github.com/chickenfeedcalc/app/issues)
- **Documentation**: [Full documentation](https://docs.chickenfeedcalc.com)
- **Community**: [Join our Discord](https://discord.gg/chickenfeedcalc)

## 🗺️ Roadmap

### Version 1.1 (Q2 2024)
- [ ] Advanced analytics and reporting
- [ ] Feed inventory management
- [ ] Multi-farm support
- [ ] Export data to Excel/PDF

### Version 1.2 (Q3 2024)
- [ ] Weather integration
- [ ] Market price alerts
- [ ] Veterinary consultation booking
- [ ] Community forum

### Version 2.0 (Q4 2024)
- [ ] AI-powered recommendations
- [ ] IoT device integration
- [ ] Advanced financial planning
- [ ] Multi-language support

---

**Made with ❤️ for African farmers**

*Empowering agriculture through technology*