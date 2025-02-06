const fs = require('fs');
const path = require('path');

// Export as a function that returns the comments data
module.exports = function() {
  // Get absolute path to comments directory
  const commentsDir = path.join(process.cwd(), '_data', 'comments');
  console.log("Looking for comments in:", commentsDir);
  
  const allComments = {};

  if (fs.existsSync(commentsDir)) {
    const files = fs.readdirSync(commentsDir)
      .filter(file => file.endsWith('.json'));
    
    console.log("Found comment files:", files);
    
    files.forEach(file => {
      try {
        const slug = path.basename(file, '.json');
        const filePath = path.join(commentsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const comments = JSON.parse(fileContent);
        
        console.log(`Processing comments for ${slug}:`, comments);
        
        if (Array.isArray(comments) && comments.length > 0) {
          allComments[slug] = comments;
        }
      } catch (error) {
        console.error(`Error processing comments file ${file}:`, error);
      }
    });
  } else {
    console.error("Comments directory not found at:", commentsDir);
  }

  return allComments;
};
