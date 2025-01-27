# 🤖 Clarity Agent

> The Ultimate AI-Powered Development Platform for Stacks Smart Contracts

Clarity Agent is a comprehensive suite of AI-powered tools designed to streamline the development, testing, and deployment of smart contracts on the Stacks blockchain. By combining cutting-edge artificial intelligence with blockchain expertise, we provide developers with an intuitive platform to build secure and efficient Clarity contracts.

![Clarity Agent Preview](client/preview.png)

## 🎥 Demo Video
Check out our demo video to see Clarity Agent in action: [Watch Demo](https://youtu.be/rZAjNDlkY4Q)

## ✨ Core Features

### 🏗️ Contract Builder
**AI-driven development and analysis tools for Stacks smart contracts**
- Intelligent code completion and suggestions
- Real-time syntax validation and error detection
- Built-in design patterns and best practices
- Interactive development environment
- Visual contract structure visualization

### 🔍 Contract Decoder
**Comprehensive analysis and understanding of Stacks contracts**
- Deep dive transaction analysis
- Function call tracing and visualization
- Event logging and monitoring
- Interactive call graph exploration
- Historical transaction patterns

### 🛡️ Auditor Agent
**AI-powered security analysis and vulnerability detection**
- Automated vulnerability scanning
- Common attack vector detection
- Gas optimization recommendations
- Clarity-specific security patterns
- Comprehensive audit reports

### 🔎 Contract Explorer
**Interactive analysis of deployed Stacks contracts**
- Real-time contract state monitoring
- Visual transaction flow analysis
- Contract interaction simulation
- Address tracking and labeling
- Custom watchlists and alerts

### 🧪 Contract Tester
**Automated test generation for Stacks contracts**
- AI-generated test scenarios
- Edge case detection
- Comprehensive coverage analysis
- Automated regression testing
- Custom test suite management

### 💡 Stacks AI Assistant
**Real-time development guidance**
- Context-aware code suggestions
- Best practice recommendations
- Optimization tips
- Interactive problem solving
- Stacks-specific documentation

## 🛠️ Tech Stack

- **Frontend**
  - React 18 with TypeScript for robust UI development
  - Vite for blazing fast builds and hot module replacement
  - Radix UI primitives for accessible components
  - Tailwind CSS for utility-first styling
  - D3.js and Recharts for dynamic data visualizations

- **Backend**
  - Node.js with Express for scalable server architecture
  - PostgreSQL for reliable data persistence
  - OpenAI integration for AI-powered features
  - WebSocket support for real-time updates
  - RESTful API design

- **Development Tools**
  - TypeScript for type-safe development
  - ESLint and Prettier for code quality
  - Jest for unit testing
  - GitHub Actions for CI/CD
  - Docker for containerization

## 🚀 Quick Start

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/clarity-agent.git
cd clarity-agent
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
Create a `.env` file in the root directory:
```env
# Required: OpenAI API Configuration
OPENAI_API_KEY=your_api_key_here

# Required: Database Configuration
PGHOST=your_host
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=your_database
PGPORT=5432
DATABASE_URL=postgresql://user:password@host:port/database

# Optional: Development Settings
NODE_ENV=development
PORT=3000
```

4. **Start Development Server**
```bash
# Start frontend development server
npm run dev

# Start backend server
npm run server
```

5. **Access the Application**
Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
clarity-agent/
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utility functions
│       ├── pages/        # Page components
│       └── types/        # TypeScript definitions
├── server/                # Backend server
│   ├── routes/           # API routes
│   ├── config/           # Server configuration
│   └── types/            # TypeScript definitions
└── db/                   # Database schema and migrations
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

