# Vercel Deployment Guide

## Important: Data Folder Inclusion

The `data/` folder must be included in your Git repository for Vercel deployment to work.

### Checking if Data Folder is Committed

Run these commands to verify:

```bash
# Check if data folder is tracked
git ls-files data/ | head -5

# Check if data folder is ignored
git check-ignore -v data/

# Check git status
git status data/
```

### If Data Folder is Not Committed

If the data folder is not being tracked, you need to force add it:

```bash
# Add the data folder (even if it's large)
git add -f data/

# Commit
git commit -m "Add data folder"

# Push
git push origin main
```

### Vercel Configuration

The `next.config.js` file is configured to include the data folder in serverless functions using `outputFileTracingIncludes`. This ensures Vercel includes the data folder when building your API routes.

### Size Limitations

- **Vercel Serverless Functions**: 50MB limit per function
- If your data folder exceeds 50MB, consider:
  1. Using Vercel Blob Storage
  2. Pre-processing data into JSON files
  3. Using a database (PostgreSQL, MongoDB, etc.)
  4. Using Git LFS for large files (requires additional Vercel configuration)

### Verifying Deployment

After deployment, check Vercel's function logs:
1. Go to your Vercel project dashboard
2. Click on "Functions" tab
3. Check the logs for `/api/companies`
4. Look for any errors about missing data folder

### Troubleshooting

If companies are not showing on Vercel:

1. **Check Build Logs**: Verify the data folder is included in the build
2. **Check Function Logs**: Look for path resolution errors
3. **Verify Git**: Ensure data folder is committed and pushed
4. **Check Size**: Ensure data folder is under 50MB

### Alternative Solutions

If the data folder is too large:

1. **Split Data**: Break into smaller chunks
2. **Use External Storage**: Store data in S3, Vercel Blob, or similar
3. **Database**: Migrate to a database solution
4. **CDN**: Serve CSV files from a CDN and fetch them at runtime





