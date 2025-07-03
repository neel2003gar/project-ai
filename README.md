# AI-Powered Data Analysis Application

A full-stack application that combines Next.js frontend with Django backend to provide AI-powered data analysis capabilities. Upload your datasets and get instant insights with advanced machine learning algorithms.

## 🚀 Features

- **Smart File Upload**: Drag & drop interface supporting CSV, Excel, and JSON files
- **AI-Powered Analysis**: Automated descriptive statistics, correlation analysis, regression, and clustering
- **Interactive Visualizations**: Beautiful charts and graphs powered by Plotly.js
- **Modern UI**: Clean, responsive interface built with Tailwind CSS and Radix UI
- **Real-time Processing**: Instant feedback and analysis results
- **RESTful API**: Well-designed backend API for data operations

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Plotly.js** for interactive visualizations
- **React Dropzone** for file uploads

### Backend
- **Django 5.2** with Django REST Framework
- **pandas** for data manipulation
- **scikit-learn** for machine learning
- **plotly** for data visualization
- **numpy** for numerical computing
- **seaborn** for statistical plotting

### AI/ML Libraries
- **pandas** - Data analysis and manipulation
- **scikit-learn** - Machine learning algorithms
- **numpy** - Numerical computing
- **plotly** - Interactive visualizations
- **seaborn** - Statistical data visualization
- **matplotlib** - Plotting library

## 📋 Prerequisites

- **Node.js** 18+
- **Python** 3.8+
- **pip** (Python package manager)
- **npm** or **yarn**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project-ai-2
```

### 2. Backend Setup (Django)
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django development server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup (Next.js)
```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📡 API Endpoints

### Datasets
- `POST /api/datasets/` - Upload a new dataset
- `GET /api/datasets/` - List all datasets
- `GET /api/datasets/{id}/` - Get dataset details
- `GET /api/datasets/{id}/preview/` - Preview dataset content

### Analyses
- `POST /api/analyses/` - Create a new analysis
- `GET /api/analyses/` - List all analyses
- `POST /api/analyses/quick_analysis/` - Perform quick analysis

### Visualizations
- `POST /api/visualizations/` - Create a new visualization
- `GET /api/visualizations/` - List all visualizations

## 🎯 Usage

1. **Upload Data**: Use the drag & drop interface to upload CSV, Excel, or JSON files
2. **Quick Analysis**: Click "Analyze" to get instant descriptive statistics and correlation analysis
3. **Advanced Analysis**: Create custom analyses for regression, clustering, or classification
4. **Visualize**: Generate interactive charts and graphs from your data
5. **Export**: Download analysis results and visualizations

## 🧪 Supported Analysis Types

- **Descriptive Statistics**: Mean, median, standard deviation, quartiles
- **Correlation Analysis**: Pearson, Spearman correlation matrices
- **Linear Regression**: Predictive modeling with feature importance
- **Clustering**: K-means clustering with visualization
- **Classification**: Random Forest classification with accuracy metrics
- **Data Visualization**: Various chart types (scatter, bar, line, heatmap)

## 📁 Project Structure

```
project-ai-2/
├── backend/                 # Django backend
│   ├── analytics/          # Main Django app
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API views
│   │   ├── serializers.py  # API serializers
│   │   └── services.py     # AI/ML analysis services
│   ├── data_analysis_api/  # Django project settings
│   └── requirements.txt    # Python dependencies
├── src/
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── DataUploader.tsx
│   │   ├── Dashboard.tsx
│   │   └── Navigation.tsx
│   └── lib/              # Utility functions
├── .github/
│   └── copilot-instructions.md
└── package.json          # Node.js dependencies
```

## 🔒 Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key
CORS_ALLOWED_ORIGINS=http://localhost:3000
CORS_ALLOW_ALL_ORIGINS=True
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Provide sample data and error messages when possible

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
```

### Backend (Production)
```bash
pip install gunicorn
gunicorn data_analysis_api.wsgi:application
```

---

**Made with ❤️ for data scientists and analysts**
