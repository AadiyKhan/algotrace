const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const SYSTEM_PROMPT = `You are a specialized JSON generator for AlgoTrace, an algorithm visualizer.
Given a LeetCode problem description, you must trace an optimal solution step-by-step on a small test case and return ONLY a valid JSON object matching this schema. Do NOT return markdown or explanation.

Schema:
{
  "title": "String (Problem Title)",
  "difficulty": "Easy|Medium|Hard",
  "type": "array|linked-list|matrix|tree|graph",
  "tags": ["Array", "String", "Tree", etc],
  "description": "String (Short summary of the problem)",
  "target": "Any optional target value",
  "pseudocode": "String (The pseudocode or JS code for the algorithm)",
  "steps": [
    {
      "codeLine": Number (Line number in pseudocode executing right now, 1-indexed),
      "note": "String (Short explanation of what is happening this step)",
      "array": [Array elements if type is array],
      "nodes": [{val: 1, next: 1}, {val: 2, next: null}] (if type is linked-list, next is index),
      "matrix": [[1, 2], [3, 4]] (if type is matrix, 2D array of values),
      "treeNodes": [{id: 0, val: 1, left: 1, right: 2}] (if type is tree, array of node objects where left/right are IDs, null if empty),
      "graphNodes": [{id: 0, val: "A"}, {id: 1, val: "B"}] (if type is graph, array of node objects),
      "graphEdges": [[0, 1], [1, 2]] (if type is graph, array of [fromId, toId] pairs),
      "i": "Value of loop variable i (optional)",
      "j": "Value of loop variable j (optional)",
      "curr": "Index or coordinate [row, col] of curr node (optional)",
      "prev": "Index or coordinate [row, col] of prev node (optional)",
      "visited": [1, 2] (Array of visited node IDs or matrix coordinates like [[0,0], [0,1]]) (optional)
    }
  ]
}`;

async function generateTrace(problemData, userCode = null, language = 'Auto') {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to your environment variables.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const tags = (problemData.topicTags || []).map(t => t.name).join(', ');
  const description = problemData.content ? problemData.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').substring(0, 1000) : "No description provided.";

  let promptInstructions = "";
  if (userCode && userCode.trim().length > 0) {
    promptInstructions += `\n\nCRITICAL INSTRUCTION: The user has provided their own custom code for this problem. You MUST trace their EXACT code logic step-by-step. Do not provide the optimal solution. If their code has bugs, infinite loops, or returns the wrong answer, trace the execution accurately to show why it fails.\n\nUSER CODE:\n${userCode}`;
  } else {
    promptInstructions += `\n\nTrace an optimal solution step-by-step on a small but illustrative test case.`;
  }

  if (language && language !== 'Auto') {
    promptInstructions += `\nWrite the pseudocode strictly in ${language}.`;
  }

  const prompt = `Problem: ${problemData.title}\nDifficulty: ${problemData.difficulty}\nTags: ${tags}\nDescription: ${description}${promptInstructions}`;

  try {
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt }
    ]);
    
    let text = result.response.text().trim();
    // Clean up potential markdown formatting from LLM response
    text = text.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        throw new Error('LLM response missing required "steps" array schema.');
      }
      return parsed;
    } catch (e) {
      throw new Error('LLM returned invalid JSON schema: ' + e.message);
    }
  } catch (error) {
    console.error("LLM Generation failed:", error);
    throw new Error("Failed to generate trace from LLM: " + error.message);
  }
}

module.exports = { generateTrace };
