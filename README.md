# Pith Analytics

**Local-First, Privacy-Focused Data Analytics Platform**

Pith Analytics is a powerful, browser-based data analytics application that runs entirely on your device. No servers, no cloud, no data leaving your machine—just pure, local-first analytics powered by cutting-edge web technologies.

![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![DuckDB](https://img.shields.io/badge/DuckDB-WASM-yellow)

---

## ✨ Key Features

### 🔒 **100% Private & Local**
- All data processing happens in your browser
- No external servers, no cloud uploads
- Your data never leaves your device
- Perfect for sensitive or confidential data analysis

### 🚀 **Powered by WebAssembly**
- **DuckDB WASM**: Full SQL database running in your browser
- Lightning-fast query execution
- Handles datasets with millions of rows
- Zero installation required

### 🤖 **AI-Powered Insights**
- **6 AI Models** to choose from (Llama 3.2, Phi 3.5, Qwen 2.5, Gemma 2, Mistral 7B)
- Natural language queries: "Show me top 10 customers by revenue"
- Automatic SQL generation from plain English
- Smart data analysis and trend detection
- Runs entirely locally using WebGPU/WebLLM

### 📊 **Comprehensive Analytics**

#### Data Ingestion
- Drag-and-drop file upload
- Support for CSV, JSON, and Parquet files
- Automatic schema detection
- Multi-file ingestion with table management

#### SQL Console
- Full-featured SQL editor with syntax highlighting
- Execute complex queries with ease
- View results in interactive tables
- Export query results

#### Interactive Visualizations
- Multiple chart types (bar, line, scatter, pie, area)
- Powered by Vega-Lite
- Responsive and interactive charts
- Export visualizations as images

#### AI Insights
- Ask questions in natural language
- Get instant SQL queries and explanations
- Model selection for speed vs. quality tradeoffs
- Cache management for optimal performance

### 🎨 **Premium Design**
- Modern, Apple-inspired UI
- Teal/emerald color scheme
- Dark and light mode support
- Glassmorphism effects and smooth animations
- Fully responsive design

### ⚙️ **Advanced Settings**
- Theme customization (Light/Dark/System)
- Export database tables (CSV or SQL dump)
- Import data from files
- Clear browser cache
- Purge AI model cache
- Privacy controls

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS + Custom Design Tokens |
| **Database** | DuckDB WASM |
| **AI Runtime** | WebLLM + WebGPU |
| **Charts** | Vega-Lite |
| **Routing** | React Router |
| **Build Tool** | Vite |

---

## 🎯 Use Cases

- **Data Analysis**: Analyze CSV/JSON files without uploading to cloud services
- **Business Intelligence**: Create dashboards and reports from local data
- **Data Science**: Explore datasets with SQL and visualizations
- **Privacy-Critical Work**: Analyze sensitive data that cannot leave your device
- **Education**: Learn SQL and data analysis in a safe, local environment
- **Prototyping**: Quick data exploration and validation

---

## 📖 How It Works

### 1. **Ingest Data**
Upload your CSV, JSON, or Parquet files. Pith automatically detects the schema and creates database tables.

### 2. **Query with SQL**
Use the SQL console to write queries, or let AI generate them for you from natural language.

### 3. **Visualize Results**
Create interactive charts and graphs to understand your data better.

### 4. **Export & Share**
Export your tables as CSV or SQL dumps. Share insights without sharing raw data.

---

## 🔐 Privacy & Security

- **Zero Network Requests**: All processing happens locally
- **No Telemetry**: We don't track your usage
- **No Account Required**: No sign-up, no login
- **Open Source**: Fully auditable code (AGPL-3.0)
- **Local Storage Only**: Data persists in your browser's IndexedDB

---

## 🚀 Performance

- **Fast Queries**: DuckDB WASM provides near-native performance
- **Large Datasets**: Handle millions of rows efficiently
- **Instant AI**: Local AI models respond in seconds
- **No Latency**: Zero network round-trips

---

## 🤝 Contributing

Contributions are welcome! This project is licensed under AGPL-3.0, which means:
- You can use, modify, and distribute this software
- If you modify and deploy it, you must share your changes
- Network use counts as distribution (AGPL requirement)

---

## 📜 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This is the strictest open-source license, ensuring that:
- Any modifications must be open-sourced
- Network use triggers the copyleft requirement
- Derivative works must use the same license

See [LICENSE](LICENSE) for full details.

---

## 🌟 Credits

Built with modern web technologies and a focus on privacy, performance, and user experience.

**Key Technologies:**
- [DuckDB](https://duckdb.org/) - In-process SQL OLAP database
- [WebLLM](https://github.com/mlc-ai/web-llm) - Large language models in the browser
- [Vega-Lite](https://vega.github.io/vega-lite/) - Declarative visualization grammar
- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

## 💡 Why "Pith"?

**Pith** (noun): *The essence or core of something; the most important part.*

Pith Analytics gets to the core of your data, extracting insights without the bloat of cloud infrastructure or privacy concerns.

---

**Made with ❤️ for data privacy and local-first computing**
