const fs = require('fs');
const path = require('path');

const premiumDescriptions = {
  "meeting-rooms": `
    <p>Given an array of meeting time intervals where <code>intervals[i] = [start<sub>i</sub>, end<sub>i</sub>]</code>, determine if a person could attend all meetings.</p>
    <p><strong>Example 1:</strong></p>
    <pre><strong>Input:</strong> intervals = [[0,30],[5,10],[15,20]]\n<strong>Output:</strong> false</pre>
    <p><strong>Example 2:</strong></p>
    <pre><strong>Input:</strong> intervals = [[7,10],[2,4]]\n<strong>Output:</strong> true</pre>
    <p><strong>Constraints:</strong></p>
    <ul>
      <li><code>0 &lt;= intervals.length &lt;= 10<sup>4</sup></code></li>
      <li><code>intervals[i].length == 2</code></li>
      <li><code>0 &lt;= start<sub>i</sub> &lt; end<sub>i</sub> &lt;= 10<sup>6</sup></code></li>
    </ul>
  `,
  "meeting-rooms-ii": `
    <p>Given an array of meeting time intervals <code>intervals</code> where <code>intervals[i] = [start<sub>i</sub>, end<sub>i</sub>]</code>, return the minimum number of conference rooms required.</p>
    <p><strong>Example 1:</strong></p>
    <pre><strong>Input:</strong> intervals = [[0,30],[5,10],[15,20]]\n<strong>Output:</strong> 2</pre>
    <p><strong>Example 2:</strong></p>
    <pre><strong>Input:</strong> intervals = [[7,10],[2,4]]\n<strong>Output:</strong> 1</pre>
    <p><strong>Constraints:</strong></p>
    <ul>
      <li><code>1 &lt;= intervals.length &lt;= 10<sup>4</sup></code></li>
      <li><code>0 &lt;= start<sub>i</sub> &lt; end<sub>i</sub> &lt;= 10<sup>6</sup></code></li>
    </ul>
  `,
  "graph-valid-tree": `
    <p>You have a graph of <code>n</code> nodes labeled from <code>0</code> to <code>n - 1</code>. You are given an integer n and a list of <code>edges</code> where <code>edges[i] = [a<sub>i</sub>, b<sub>i</sub>]</code> indicates that there is an undirected edge between nodes <code>a<sub>i</sub></code> and <code>b<sub>i</sub></code> in the graph.</p>
    <p>Return <code>true</code> if the edges of the given graph make up a valid tree, and <code>false</code> otherwise.</p>
    <p><strong>Example 1:</strong></p>
    <pre><strong>Input:</strong> n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]\n<strong>Output:</strong> true</pre>
    <p><strong>Example 2:</strong></p>
    <pre><strong>Input:</strong> n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]\n<strong>Output:</strong> false</pre>
  `,
  "alien-dictionary": `
    <p>There is a new alien language that uses the English alphabet. However, the order among the letters is unknown to you.</p>
    <p>You are given a list of strings <code>words</code> from the alien language's dictionary, where the strings in <code>words</code> are sorted lexicographically by the rules of this new language.</p>
    <p>Return a string of the unique letters in the new alien language sorted in lexicographically increasing order by the new language's rules. If there is no solution, return <code>""</code>. If there are multiple solutions, return any of them.</p>
    <p><strong>Example 1:</strong></p>
    <pre><strong>Input:</strong> words = ["wrt","wrf","er","ett","rftt"]\n<strong>Output:</strong> "wertf"</pre>
    <p><strong>Example 2:</strong></p>
    <pre><strong>Input:</strong> words = ["z","x"]\n<strong>Output:</strong> "zx"</pre>
    <p><strong>Example 3:</strong></p>
    <pre><strong>Input:</strong> words = ["z","x","z"]\n<strong>Output:</strong> ""\n<strong>Explanation:</strong> The order is invalid, so return "".</pre>
  `,
  "encode-and-decode-strings": `
    <p>Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings.</p>
    <p><strong>Example 1:</strong></p>
    <pre><strong>Input:</strong> dummy_input = ["Hello","World"]\n<strong>Output:</strong> ["Hello","World"]</pre>
    <p><strong>Example 2:</strong></p>
    <pre><strong>Input:</strong> dummy_input = [""]\n<strong>Output:</strong> [""]</pre>
  `,
  "number-of-connected-components-in-an-undirected-graph": `
    <p>You have a graph of <code>n</code> nodes. You are given an integer <code>n</code> and an array <code>edges</code> where <code>edges[i] = [a<sub>i</sub>, b<sub>i</sub>]</code> indicates that there is an edge between <code>a<sub>i</sub></code> and <code>b<sub>i</sub></code> in the graph.</p>
    <p>Return the number of connected components in the graph.</p>
    <p><strong>Example 1:</strong></p>
    <pre><strong>Input:</strong> n = 5, edges = [[0,1],[1,2],[3,4]]\n<strong>Output:</strong> 2</pre>
    <p><strong>Example 2:</strong></p>
    <pre><strong>Input:</strong> n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]\n<strong>Output:</strong> 1</pre>
  `
};

for (const [slug, html] of Object.entries(premiumDescriptions)) {
  const filePath = path.join(__dirname, '../server/data/traces', `${slug}.json`);
  if (fs.existsSync(filePath)) {
    const trace = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    trace.fullDescription = html.trim();
    fs.writeFileSync(filePath, JSON.stringify(trace, null, 2));
    console.log(`✅ Patched premium description for ${slug}`);
  }
}
