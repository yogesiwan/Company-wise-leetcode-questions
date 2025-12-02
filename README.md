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

1. **Ensure data folder is committed**: The `data/` folder must be committed to Git (it's not in `.gitignore`)
2. Push your code to GitHub
3. Import the project in Vercel
4. Vercel will automatically detect Next.js and deploy

### Important Notes for Vercel Deployment:

- **Data Folder Size**: Vercel has a 50MB limit for serverless functions. If your `data/` folder exceeds this, consider:
  - Using Vercel Blob Storage
  - Pre-processing data into JSON files
  - Using a database instead of file system
  
- **Verification**: The build process includes a verification step to ensure the data folder is accessible. Check build logs if deployment fails.

- **GitHub Display**: If you see "blob/main/data" on GitHub, that's normal - it's just how GitHub displays folders in the repository browser.

## Technologies

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- next-themes (for theme support)

