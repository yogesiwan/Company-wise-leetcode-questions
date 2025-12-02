# LeetCode Prep - Company Question Filter

A Next.js application for filtering and searching LeetCode questions by company, difficulty, and frequency.

## Features

- **Company Filtering**: Filter questions by one or multiple companies
- **Multi-Company Modes**: 
  - Union: Show all questions from selected companies
  - Intersection: Show only common questions across selected companies
- **Difficulty Filtering**: Filter by Easy, Medium, or Hard
- **Frequency Filtering**: Filter by frequency percentage range
- **Time Period Filtering**: Filter by time periods (all, 6 months, 3 months, 30 days, more than 6 months)
- **Most Frequent Questions**: View questions that appear across multiple companies
- **Dark/Light Theme**: Toggle between dark and light themes

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `data/` - Contains company folders with CSV files
- `app/` - Next.js app directory with pages and API routes
- `components/` - React components
- `lib/` - Utility functions for data parsing and filtering
- `types/` - TypeScript type definitions

## Data Format

Each company folder contains CSV files with the following format:
- `all.csv` - All questions ever asked
- `six-months.csv` - Questions from last 6 months
- `three-months.csv` - Questions from last 3 months
- `thirty-days.csv` - Questions from last 30 days
- `more-than-six-months.csv` - Questions older than 6 months

CSV format: `ID,URL,Title,Difficulty,Acceptance %,Frequency %`

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Vercel will automatically detect Next.js and deploy

## Technologies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- next-themes (for theme support)

