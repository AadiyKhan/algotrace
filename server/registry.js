const registry = {
  'two-sum': {
    title: 'Two Sum', difficulty: 'Easy', type: 'array',
    tags: ['Array', 'Hash Table'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.\n\nYou may assume each input has exactly one solution.',
    target: 9,
    steps: [
      { array:[2,7,11,15], i:null, j:null, currentMap:{},    codeLine:2, note:'Initialize an empty hash map to store value → index pairs.' },
      { array:[2,7,11,15], i:0,    j:null, currentMap:{},    codeLine:3, note:'i = 0. Current value: nums[0] = 2.' },
      { array:[2,7,11,15], i:0,    j:null, currentMap:{},    codeLine:4, note:'Complement = 9 − 2 = 7. We need to find 7 in the map.' },
      { array:[2,7,11,15], i:0,    j:null, currentMap:{},    codeLine:5, note:'Is 7 in the map? No — map is empty. Move on.' },
      { array:[2,7,11,15], i:0,    j:null, currentMap:{2:0}, codeLine:8, note:'Store map[2] = 0.' },
      { array:[2,7,11,15], i:1,    j:null, currentMap:{2:0}, codeLine:3, note:'i = 1. Current value: nums[1] = 7.' },
      { array:[2,7,11,15], i:1,    j:null, currentMap:{2:0}, codeLine:4, note:'Complement = 9 − 7 = 2. We need to find 2 in the map.' },
      { array:[2,7,11,15], i:1,    j:0,    currentMap:{2:0}, codeLine:5, note:'Is 2 in the map? YES! map[2] = 0. Pair found at [0, 1].' },
      { array:[2,7,11,15], i:1,    j:0,    currentMap:{2:0}, codeLine:6, note:'Return [0, 1]. ✓' },
    ],
    pseudocode: `function twoSum(nums, target):
  map = new HashMap()
  for i from 0 to nums.length - 1:
    complement = target - nums[i]
    if complement exists in map:
      return [map.get(complement), i]
    else:
      map.put(nums[i], i)
  return []`,
  },

  'binary-search': {
    title: 'Binary Search', difficulty: 'Easy', type: 'array',
    tags: ['Array', 'Binary Search'],
    description: 'Given a sorted array of integers and a target value, return the index of the target or -1 if not found.\n\nMust run in O(log n) time.',
    target: 11,
    steps: [
      { array:[2,5,8,11,15,20,25], i:0, j:6,    currentMap:{},      codeLine:2, note:'Initialize: left = 0, right = 6. Search space is the full array.' },
      { array:[2,5,8,11,15,20,25], i:0, j:6,    currentMap:{mid:3}, codeLine:4, note:'mid = ⌊(0+6)/2⌋ = 3. nums[3] = 11.' },
      { array:[2,5,8,11,15,20,25], i:0, j:6,    currentMap:{mid:3}, codeLine:5, note:'nums[3] = 11 equals target = 11. Found!' },
      { array:[2,5,8,11,15,20,25], i:0, j:6,    currentMap:{mid:3}, codeLine:6, note:'Return mid = 3. ✓' },
    ],
    pseudocode: `function binarySearch(nums, target):
  left = 0
  right = nums.length - 1
  while left <= right:
    mid = (left + right) / 2
    if nums[mid] == target:
      return mid
    else if nums[mid] < target:
      left = mid + 1
    else:
      right = mid - 1
  return -1`,
  },

  'valid-parentheses': {
    title: 'Valid Parentheses', difficulty: 'Easy', type: 'array',
    tags: ['String', 'Stack'],
    description: "Given a string containing '(', ')', '{', '}', '[', ']', determine if the input string is valid.",
    target: null,
    steps: [
      { array:['(','[','{','}',']',')'], i:null, j:null, currentMap:{ stack:[] },           codeLine:2, note:"Initialize empty stack." },
      { array:['(','[','{','}',']',')'], i:0,    j:null, currentMap:{ stack:['('] },        codeLine:4, note:"'(' is opening — push. Stack: ['(']" },
      { array:['(','[','{','}',']',')'], i:1,    j:null, currentMap:{ stack:['(','['] },    codeLine:4, note:"'[' is opening — push. Stack: ['(','[']" },
      { array:['(','[','{','}',']',')'], i:2,    j:null, currentMap:{ stack:['(','[','{']}, codeLine:4, note:"'{' is opening — push. Stack: ['(','[','{']" },
      { array:['(','[','{','}',']',')'], i:3,    j:null, currentMap:{ stack:['(','['] },    codeLine:9, note:"'}' matches '{' on top — pop. Stack: ['(','[']" },
      { array:['(','[','{','}',']',')'], i:4,    j:null, currentMap:{ stack:['('] },        codeLine:9, note:"']' matches '[' on top — pop. Stack: ['(']" },
      { array:['(','[','{','}',']',')'], i:5,    j:null, currentMap:{ stack:[] },           codeLine:9, note:"')' matches '(' on top — pop. Stack: []" },
      { array:['(','[','{','}',']',')'], i:null, j:null, currentMap:{ stack:[] },           codeLine:11, note:"Stack empty — all matched. Return true. ✓" },
    ],
    pseudocode: `function isValid(s):
  stack = []
  for char in s:
    if char is opening bracket:
      stack.push(char)
    else if stack is empty:
      return false
    else if top != matching bracket:
      return false
    else:
      stack.pop()
  return stack is empty`,
  },

  'reverse-linked-list': {
    title: 'Reverse Linked List', difficulty: 'Easy', type: 'linked-list',
    tags: ['Linked List', 'Recursion'],
    description: 'Given the head of a singly linked list, reverse the list in-place and return the new head.\n\nO(n) time, O(1) space.',
    steps: [
      { nodes:[{val:1,next:1},{val:2,next:2},{val:3,next:null}], curr:0, prev:null, nextPtr:null, codeLine:2, note:'prev = null, curr = head (node 1).' },
      { nodes:[{val:1,next:1},{val:2,next:2},{val:3,next:null}], curr:0, prev:null, nextPtr:1,    codeLine:5, note:'Save nextTemp = node 2 before overwriting pointer.' },
      { nodes:[{val:1,next:null},{val:2,next:2},{val:3,next:null}], curr:0, prev:null, nextPtr:1, codeLine:6, note:'curr.next = prev = null. Node 1 now points to null.' },
      { nodes:[{val:1,next:null},{val:2,next:2},{val:3,next:null}], curr:0, prev:0,   nextPtr:1, codeLine:7, note:'prev = curr = node 1.' },
      { nodes:[{val:1,next:null},{val:2,next:2},{val:3,next:null}], curr:1, prev:0,   nextPtr:1, codeLine:8, note:'curr = nextTemp = node 2.' },
      { nodes:[{val:1,next:null},{val:2,next:2},{val:3,next:null}], curr:1, prev:0,   nextPtr:2, codeLine:5, note:'Save nextTemp = node 3.' },
      { nodes:[{val:1,next:null},{val:2,next:0},{val:3,next:null}], curr:1, prev:0,   nextPtr:2, codeLine:6, note:'curr.next = prev = node 1. Node 2 → node 1.' },
      { nodes:[{val:1,next:null},{val:2,next:0},{val:3,next:null}], curr:1, prev:1,   nextPtr:2, codeLine:7, note:'prev = node 2.' },
      { nodes:[{val:1,next:null},{val:2,next:0},{val:3,next:null}], curr:2, prev:1,   nextPtr:2, codeLine:8, note:'curr = node 3.' },
      { nodes:[{val:1,next:null},{val:2,next:0},{val:3,next:null}], curr:2, prev:1,   nextPtr:null, codeLine:5, note:'Save nextTemp = null.' },
      { nodes:[{val:1,next:null},{val:2,next:0},{val:3,next:1}],   curr:2, prev:1,   nextPtr:null, codeLine:6, note:'curr.next = prev = node 2. Node 3 → node 2.' },
      { nodes:[{val:1,next:null},{val:2,next:0},{val:3,next:1}],   curr:2, prev:2,   nextPtr:null, codeLine:7, note:'prev = node 3. New head!' },
      { nodes:[{val:1,next:null},{val:2,next:0},{val:3,next:1}],   curr:null, prev:2, nextPtr:null, codeLine:8, note:'curr = null — loop ends. 3→2→1.' },
      { nodes:[{val:1,next:null},{val:2,next:0},{val:3,next:1}],   curr:null, prev:2, nextPtr:null, codeLine:9, note:'Return prev = node 3. ✓' },
    ],
    pseudocode: `function reverseList(head):
  prev = null
  curr = head
  while curr is not null:
    nextTemp = curr.next
    curr.next = prev
    prev = curr
    curr = nextTemp
  return prev`,
  },
  'merge-intervals': {
    title: 'Merge Intervals', difficulty: 'Medium', type: 'array',
    tags: ['Array', 'Sorting'],
    description: 'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    target: null,
    steps: [
      { array:[[1,3],[2,6],[8,10],[15,18]], i:0, currentMap:{ merged:[] }, codeLine:2, note:'Initialize empty merged list.' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:0, currentMap:{ merged:[[1,3]] }, codeLine:8, note:'i=0: Merged list is empty, so we just add [1,3].' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:1, currentMap:{ merged:[[1,3]] }, codeLine:3, note:'i=1: Look at interval [2,6].' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:1, currentMap:{ merged:[[1,3]] }, codeLine:5, note:'Does [2,6] overlap with last merged interval [1,3]? Yes, 2 <= 3.' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:1, currentMap:{ merged:[[1,6]] }, codeLine:6, note:'Merge them! Update end to max(3, 6) = 6. Merged is now [1,6].' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:2, currentMap:{ merged:[[1,6]] }, codeLine:3, note:'i=2: Look at interval [8,10].' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:2, currentMap:{ merged:[[1,6]] }, codeLine:5, note:'Does [8,10] overlap with [1,6]? No, 8 > 6.' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:2, currentMap:{ merged:[[1,6],[8,10]] }, codeLine:8, note:'Add [8,10] as a distinct interval to merged list.' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:3, currentMap:{ merged:[[1,6],[8,10]] }, codeLine:3, note:'i=3: Look at interval [15,18].' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:3, currentMap:{ merged:[[1,6],[8,10]] }, codeLine:5, note:'Does [15,18] overlap with [8,10]? No, 15 > 10.' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:3, currentMap:{ merged:[[1,6],[8,10],[15,18]] }, codeLine:8, note:'Add [15,18] as a distinct interval to merged list.' },
      { array:[[1,3],[2,6],[8,10],[15,18]], i:null, currentMap:{ merged:[[1,6],[8,10],[15,18]] }, codeLine:9, note:'Loop finishes. Return merged list. ✓' },
    ],
    pseudocode: `function merge(intervals):
  merged = []
  for interval in intervals:
    last = merged.last()
    if not merged.isEmpty() and interval.start <= last.end:
      last.end = max(last.end, interval.end)
    else:
      merged.append(interval)
  return merged`,
  },
};

module.exports = registry;
