const crypto = require("crypto");

// Configure these in Netlify environment variables
const {
  GITHUB_TOKEN,
  GITHUB_REPO_OWNER,
  GITHUB_REPO_NAME,
  SPAM_SECRET
} = process.env;

const rateLimit = new Map();

exports.handler = async (event, context) => {
  console.log('Function invoked with method:', event.httpMethod);
  
  try {
    // Dynamically import Octokit
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({
      auth: GITHUB_TOKEN
    });

    // Log environment setup (excluding sensitive token)
    console.log('Environment check:', {
      hasToken: !!GITHUB_TOKEN,
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME
    });
    
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const ip = event.headers["client-ip"];
    const now = Date.now();
    
    // Rate limiting
    if (rateLimit.has(ip)) {
      const lastSubmit = rateLimit.get(ip);
      if (now - lastSubmit < 60000) { // 1 minute cooldown
        console.log('Rate limit hit for IP:', ip);
        return {
          statusCode: 429,
          body: JSON.stringify({ error: "Please wait before submitting another comment" })
        };
      }
    }
    
    console.log('Parsing request body');
    const body = JSON.parse(event.body);
    const { name, comment, postSlug, honeypot } = body;
    
    console.log('Received comment for slug:', postSlug);

    // Spam check
    if (honeypot) {
      console.log('Honeypot triggered');
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    // Validate inputs
    if (!name || !comment || !postSlug) {
      console.log('Missing required fields:', { name: !!name, comment: !!comment, postSlug: !!postSlug });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    const commentId = crypto.randomBytes(16).toString("hex");
    const timestamp = new Date().toISOString();

    const commentData = {
      id: commentId,
      name,
      comment,
      timestamp,
      postSlug
    };

    // Create/update comments file in GitHub
    const path = `_data/comments/${postSlug}.json`;
    console.log('Attempting to access/create file:', path);
    
    // Try to get existing file
    let existingComments = [];
    try {
      console.log('Fetching existing comments');
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
        path
      });
      
      const content = Buffer.from(data.content, 'base64').toString();
      existingComments = JSON.parse(content);
      console.log('Found existing comments:', existingComments.length);
    } catch (error) {
      console.log('No existing comments file found:', error.message);
      // File doesn't exist yet, that's ok
    }

    existingComments.push(commentData);

    console.log('Saving comment to GitHub');
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      path,
      message: `Add comment ${commentId}`,
      content: Buffer.from(JSON.stringify(existingComments, null, 2)).toString('base64'),
      branch: 'main'
    });

    console.log('Comment saved successfully');
    rateLimit.set(ip, now);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      })
    };
  }
}; 