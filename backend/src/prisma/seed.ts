import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Campus Bridge Placement Database with Clean LeetCode Signatures...');

  // 1. Create demo users
  const studentPassword = await bcrypt.hash('placement2026', 10);
  const trainerPassword = await bcrypt.hash('trainer2026', 10);

  const student = await prisma.user.upsert({
    where: { email: 'student@placement.edu' },
    update: {},
    create: {
      email: 'student@placement.edu',
      password: studentPassword,
      name: 'Aditya Sharma',
      college: 'Indian Institute of Information Technology',
      graduationYear: 2026,
      targetCompany: 'Amazon / Microsoft / TCS Prime',
      role: 'STUDENT',
    },
  });

  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@placement.edu' },
    update: {},
    create: {
      email: 'trainer@placement.edu',
      password: trainerPassword,
      name: 'Prof. Rajesh Verma',
      college: 'Training & Placement Cell',
      graduationYear: 2024,
      targetCompany: 'Placement Officer',
      role: 'TRAINER',
    },
  });

  // 2. High Quality Placement Problems with Clean Signatures
  const problemsData = [
    {
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'EASY',
      category: 'Arrays',
      order: 1,
      acceptanceRate: 52.4,
      companyTags: JSON.stringify(['Amazon', 'Google', 'TCS NQT', 'Microsoft', 'Cognizant']),
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
      examples: JSON.stringify([
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
          explanation: 'nums[1] + nums[2] == 6, return [1, 2].',
        },
        {
          input: 'nums = [3,3], target = 6',
          output: '[0,1]',
          explanation: 'nums[0] + nums[1] == 6, return [0, 1].',
        },
      ]),
      constraints: JSON.stringify([
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.',
      ]),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
    
};
`,
      }),
      hints: [
        'A brute force approach checks all pairs with two loops in O(N^2) time.',
        'Can you use a Hash Table to look up the complement in O(1) time?',
      ],
      solution: `### Optimal Approach: Hash Map (Single Pass)
**Time Complexity:** O(N)
**Space Complexity:** O(N)

We iterate through the array once while keeping a hash map of seen numbers and their indices. For each element \`x\`, we calculate its complement \`target - x\`. If the complement exists in our map, we have found our pair!`,
      testCases: [
        { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false, explanation: 'Basic example' },
        { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false, explanation: 'Non-zero start' },
        { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: false, explanation: 'Duplicate numbers' },
        { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]', isHidden: true, explanation: 'Negative numbers' },
        { input: '[1000000,500,200,999999]\n1999999', expectedOutput: '[0,3]', isHidden: true, explanation: 'Large numbers' },
      ],
    },
    {
      slug: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'EASY',
      category: 'Stack',
      order: 2,
      acceptanceRate: 40.5,
      companyTags: JSON.stringify(['Microsoft', 'Amazon', 'Infosys', 'Capgemini', 'TCS Digital']),
      description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
      examples: JSON.stringify([
        { input: 's = "()"', output: 'true', explanation: 'Matched round bracket' },
        { input: 's = "()[]{}"', output: 'true', explanation: 'All matching' },
        { input: 's = "(]"', output: 'false', explanation: 'Mismatched types' },
      ]),
      constraints: JSON.stringify([
        '1 <= s.length <= 10^4',
        's consists of parentheses only: ()[]{}',
      ]),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Write your code here
    
};
`,
      }),
      hints: [
        'Use a LIFO data structure like a stack to keep track of openings.',
        'When you encounter a closing bracket, the top of the stack must be its matching opener.',
      ],
      solution: `### Optimal Stack Approach
**Time Complexity:** O(N)
**Space Complexity:** O(N)

Every opening bracket gets pushed onto the stack. When encountering a closing bracket, pop from the stack and verify that the types match. Finally, the stack must be empty for the string to be valid.`,
      testCases: [
        { input: '()', expectedOutput: 'true', isHidden: false },
        { input: '()[]{}', expectedOutput: 'true', isHidden: false },
        { input: '(]', expectedOutput: 'false', isHidden: false },
        { input: '([)]', expectedOutput: 'false', isHidden: true },
        { input: '{[]}', expectedOutput: 'true', isHidden: true },
        { input: '((((((', expectedOutput: 'false', isHidden: true },
      ],
    },
    {
      slug: 'best-time-to-buy-and-sell-stock',
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'EASY',
      category: 'Arrays',
      order: 3,
      acceptanceRate: 54.1,
      companyTags: JSON.stringify(['Amazon', 'Morgan Stanley', 'Google', 'TCS Prime', 'Wipro']),
      description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
      examples: JSON.stringify([
        {
          input: 'prices = [7,1,5,3,6,4]',
          output: '5',
          explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.',
        },
        {
          input: 'prices = [7,6,4,3,1]',
          output: '0',
          explanation: 'In this case, no transactions are done and the max profit = 0.',
        },
      ]),
      constraints: JSON.stringify([
        '1 <= prices.length <= 10^5',
        '0 <= prices[i] <= 10^4',
      ]),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    // Write your code here
    
};
`,
      }),
      hints: [
        'Track the minimum price seen so far as you iterate through the list.',
        'At each day, the potential profit is prices[i] - min_price.',
      ],
      solution: `### Single Pass Greedy Algorithm
**Time Complexity:** O(N)
**Space Complexity:** O(1)

We maintain two variables: min_price and max_profit. One linear scan achieves O(N) runtime.`,
      testCases: [
        { input: '[7,1,5,3,6,4]', expectedOutput: '5', isHidden: false },
        { input: '[7,6,4,3,1]', expectedOutput: '0', isHidden: false },
        { input: '[2,4,1]', expectedOutput: '2', isHidden: true },
        { input: '[3,2,6,5,0,3]', expectedOutput: '4', isHidden: true },
      ],
    },
    {
      slug: 'maximum-subarray',
      title: "Maximum Subarray (Kadane's Algorithm)",
      difficulty: 'MEDIUM',
      category: 'Arrays',
      order: 4,
      acceptanceRate: 50.3,
      companyTags: JSON.stringify(['Amazon', 'Google', 'Microsoft', 'TCS NQT', 'Infosys DPhi']),
      description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
      examples: JSON.stringify([
        {
          input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
          output: '6',
          explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
        },
        {
          input: 'nums = [1]',
          output: '1',
          explanation: 'The subarray [1] has the largest sum 1.',
        },
        {
          input: 'nums = [5,4,-1,7,8]',
          output: '23',
          explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.',
        },
      ]),
      constraints: JSON.stringify([
        '1 <= nums.length <= 10^5',
        '-10^4 <= nums[i] <= 10^4',
      ]),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    // Write your code here
    
};
`,
      }),
      hints: [
        'Kadane’s algorithm runs in O(N).',
        'At each step, decide whether to add current element to ongoing subarray or start fresh.',
      ],
      solution: `### Kadane's Algorithm
**Time Complexity:** O(N)
**Space Complexity:** O(1)`,
      testCases: [
        { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
        { input: '[1]', expectedOutput: '1', isHidden: false },
        { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: false },
        { input: '[-1]', expectedOutput: '-1', isHidden: true },
      ],
    },
    {
      slug: 'longest-substring-without-repeating-characters',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'MEDIUM',
      category: 'Sliding Window',
      order: 5,
      acceptanceRate: 34.6,
      companyTags: JSON.stringify(['Amazon', 'Google', 'Microsoft', 'Adobe', 'Flipkart']),
      description: `Given a string \`s\`, find the length of the **longest substring** without duplicate characters.`,
      examples: JSON.stringify([
        { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' },
        { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with length 1.' },
        { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with length 3.' },
      ]),
      constraints: JSON.stringify([
        '0 <= s.length <= 5 * 10^4',
        's consists of English letters, digits, symbols and spaces.',
      ]),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    // Write your code here
    
};
`,
      }),
      hints: [
        'Use sliding window with two pointers [left, right].',
      ],
      solution: `### Sliding Window with Hash Map
**Time Complexity:** O(N)
**Space Complexity:** O(min(N, M))`,
      testCases: [
        { input: 'abcabcbb', expectedOutput: '3', isHidden: false },
        { input: 'bbbbb', expectedOutput: '1', isHidden: false },
        { input: 'pwwkew', expectedOutput: '3', isHidden: false },
        { input: 'au', expectedOutput: '2', isHidden: true },
      ],
    },
    {
      slug: 'coin-change',
      title: 'Coin Change',
      difficulty: 'MEDIUM',
      category: 'Dynamic Programming',
      order: 6,
      acceptanceRate: 42.8,
      companyTags: JSON.stringify(['Amazon', 'Google', 'TCS Digital', 'Goldman Sachs', 'Infosys']),
      description: `You are given an integer array \`coins\` and an integer \`amount\`. Return the fewest number of coins needed to make up that amount, or \`-1\` if impossible.`,
      examples: JSON.stringify([
        { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
        { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Cannot form 3.' },
      ]),
      constraints: JSON.stringify([
        '1 <= coins.length <= 12',
        '0 <= amount <= 10^4',
      ]),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
var coinChange = function(coins, amount) {
    // Write your code here
    
};
`,
      }),
      hints: [
        'Think bottom-up DP: dp[i] represents min coins to make amount i.',
      ],
      solution: `### Dynamic Programming (Bottom-Up)
**Time Complexity:** O(amount * len(coins))
**Space Complexity:** O(amount)`,
      testCases: [
        { input: '[1,2,5]\n11', expectedOutput: '3', isHidden: false },
        { input: '[2]\n3', expectedOutput: '-1', isHidden: false },
        { input: '[1]\n0', expectedOutput: '0', isHidden: false },
      ],
    },
    {
      slug: 'number-of-islands',
      title: 'Number of Islands',
      difficulty: 'MEDIUM',
      category: 'Graphs',
      order: 7,
      acceptanceRate: 57.8,
      companyTags: JSON.stringify(['Amazon', 'Microsoft', 'Google', 'Infosys DPhi']),
      description: `Given an \`m x n\` 2D binary grid \`grid\` representing a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.`,
      examples: JSON.stringify([
        {
          input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
          output: '1',
          explanation: 'All 1s connect to form a single island.',
        },
      ]),
      constraints: JSON.stringify(['1 <= m, n <= 300']),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int numIslands(char[][] grid) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function(grid) {
    // Write your code here
    
};
`,
      }),
      hints: ['Traverse the grid with DFS or BFS.'],
      solution: `### Graph DFS (Connected Components)
**Time Complexity:** O(M * N)
**Space Complexity:** O(M * N)`,
      testCases: [
        {
          input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
          expectedOutput: '1',
          isHidden: false,
        },
        {
          input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
          expectedOutput: '3',
          isHidden: false,
        },
      ],
    },
    {
      slug: 'climbing-stairs',
      title: 'Climbing Stairs',
      difficulty: 'EASY',
      category: 'Dynamic Programming',
      order: 8,
      acceptanceRate: 52.8,
      companyTags: JSON.stringify(['Amazon', 'TCS NQT', 'Infosys', 'Capgemini']),
      description: `You are climbing a staircase. It takes \`n\` steps to reach the top. Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
      examples: JSON.stringify([
        { input: 'n = 2', output: '2', explanation: '1+1 or 2' },
        { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
      ]),
      constraints: JSON.stringify(['1 <= n <= 45']),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int climbStairs(int n) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    // Write your code here
    
};
`,
      }),
      hints: ['f(n) = f(n-1) + f(n-2) (Fibonacci sequence).'],
      solution: `### Fibonacci DP
**Time Complexity:** O(N)
**Space Complexity:** O(1)`,
      testCases: [
        { input: '2', expectedOutput: '2', isHidden: false },
        { input: '3', expectedOutput: '3', isHidden: false },
        { input: '5', expectedOutput: '8', isHidden: true },
      ],
    },
    {
      slug: 'trapping-rain-water',
      title: 'Trapping Rain Water',
      difficulty: 'HARD',
      category: 'Two Pointers',
      order: 9,
      acceptanceRate: 61.2,
      companyTags: JSON.stringify(['Google', 'Amazon', 'Microsoft', 'Goldman Sachs']),
      description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
      examples: JSON.stringify([
        {
          input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
          output: '6',
          explanation: 'Traps 6 units of rain water.',
        },
      ]),
      constraints: JSON.stringify(['1 <= n <= 2 * 10^4']),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def trap(self, height: List[int]) -> int:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int trap(int[] height) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {
    // Write your code here
    
};
`,
      }),
      hints: ['Use Two Pointers inward to eliminate extra space.'],
      solution: `### Two Pointers Technique
**Time Complexity:** O(N)
**Space Complexity:** O(1)`,
      testCases: [
        { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', isHidden: false },
        { input: '[4,2,0,3,2,5]', expectedOutput: '9', isHidden: false },
      ],
    },
    {
      slug: 'merge-intervals',
      title: 'Merge Intervals',
      difficulty: 'MEDIUM',
      category: 'Intervals',
      order: 10,
      acceptanceRate: 47.1,
      companyTags: JSON.stringify(['Google', 'Amazon', 'Microsoft', 'JPMorgan']),
      description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals.`,
      examples: JSON.stringify([
        {
          input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
          output: '[[1,6],[8,10],[15,18]]',
          explanation: 'Merged intervals [1,3] and [2,6] into [1,6].',
        },
      ]),
      constraints: JSON.stringify(['1 <= intervals.length <= 10^4']),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function(intervals) {
    // Write your code here
    
};
`,
      }),
      hints: ['Sort intervals by start times.'],
      solution: `### Sorting Interval Sweep
**Time Complexity:** O(N log N)
**Space Complexity:** O(N)`,
      testCases: [
        { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
        { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: false },
      ],
    },
    {
      slug: 'kth-largest-element-in-an-array',
      title: 'Kth Largest Element in an Array',
      difficulty: 'MEDIUM',
      category: 'Heap / Priority Queue',
      order: 11,
      acceptanceRate: 67.2,
      companyTags: JSON.stringify(['Amazon', 'Google', 'Meta', 'Wipro Turbo']),
      description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\`th largest element in the array.`,
      examples: JSON.stringify([
        { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5', explanation: '2nd largest is 5.' },
      ]),
      constraints: JSON.stringify(['1 <= k <= nums.length <= 10^5']),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var findKthLargest = function(nums, k) {
    // Write your code here
    
};
`,
      }),
      hints: ['Use a min-heap of size k.'],
      solution: `### Min Heap of size K
**Time Complexity:** O(N log K)
**Space Complexity:** O(K)`,
      testCases: [
        { input: '[3,2,1,5,6,4]\n2', expectedOutput: '5', isHidden: false },
        { input: '[3,2,3,1,2,4,5,5,6]\n4', expectedOutput: '4', isHidden: false },
      ],
    },
    {
      slug: 'valid-palindrome',
      title: 'Valid Palindrome',
      difficulty: 'EASY',
      category: 'Strings',
      order: 12,
      acceptanceRate: 46.9,
      companyTags: JSON.stringify(['TCS NQT', 'Accenture', 'Cognizant', 'Infosys']),
      description: `Given a string \`s\`, return \`true\` if it is a palindrome after removing non-alphanumeric characters and lowercasing.`,
      examples: JSON.stringify([
        {
          input: 's = "A man, a plan, a canal: Panama"',
          output: 'true',
          explanation: '"amanaplanacanalpanama" is a palindrome.',
        },
      ]),
      constraints: JSON.stringify(['1 <= s.length <= 2 * 10^5']),
      defaultTemplates: JSON.stringify({
        python: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Write your code here
        pass
`,
        cpp: `class Solution {
public:
    bool isPalindrome(string s) {
        // Write your code here
        
    }
};
`,
        java: `class Solution {
    public boolean isPalindrome(String s) {
        // Write your code here
        
    }
}
`,
        javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function(s) {
    // Write your code here
    
};
`,
      }),
      hints: ['Use two pointers inwards skipping non-alphanumerics.'],
      solution: `### Two Pointers
**Time Complexity:** O(N)
**Space Complexity:** O(1)`,
      testCases: [
        { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true', isHidden: false },
        { input: 'race a car', expectedOutput: 'false', isHidden: false },
        { input: ' ', expectedOutput: 'true', isHidden: false },
      ],
    },
  ];

  for (const prob of problemsData) {
    const { testCases, hints, ...rest } = prob;
    const createdProblem = await prisma.problem.upsert({
      where: { slug: rest.slug },
      update: {
        ...rest,
        hints: JSON.stringify(hints || []),
      },
      create: {
        ...rest,
        hints: JSON.stringify(hints || []),
      },
    });

    await prisma.testCase.deleteMany({
      where: { problemId: createdProblem.id },
    });

    for (const tc of testCases) {
      await prisma.testCase.create({
        data: {
          problemId: createdProblem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden || false,
          explanation: (tc as any).explanation || '',
        },
      });
    }
  }

  // 3. SDE Sheets
  const sheetsData = [
    {
      slug: 'placement-technicals-core-100',
      title: 'Placement Technicals 100 (Most Asked)',
      description: 'The golden collection of core problems asked across On-Campus & Off-Campus technical drives.',
      category: 'Placement 100',
      icon: 'Target',
      problemSlugs: JSON.stringify([
        'two-sum',
        'valid-parentheses',
        'best-time-to-buy-and-sell-stock',
        'maximum-subarray',
        'longest-substring-without-repeating-characters',
        'coin-change',
        'number-of-islands',
        'climbing-stairs',
        'trapping-rain-water',
        'merge-intervals',
        'kth-largest-element-in-an-array',
        'valid-palindrome',
      ]),
    },
    {
      slug: 'service-mnc-tcs-infosys-wipro',
      title: 'Service MNC Track (TCS, Infosys, Wipro, Cognizant)',
      description: 'Frequently repeated coding problems in TCS NQT, Infosys DPhi/HackWithInfy, Wipro Turbo & Cognizant GenC Next.',
      category: 'Service MNCs',
      icon: 'Briefcase',
      problemSlugs: JSON.stringify([
        'two-sum',
        'valid-parentheses',
        'best-time-to-buy-and-sell-stock',
        'maximum-subarray',
        'climbing-stairs',
        'valid-palindrome',
      ]),
    },
    {
      slug: 'blind-75-placement-essentials',
      title: 'Blind 75 Placement Essentials',
      description: 'The universally recognized Blind 75 pattern sheet for mastering algorithms and data structures.',
      category: 'Blind 75',
      icon: 'Zap',
      problemSlugs: JSON.stringify([
        'two-sum',
        'best-time-to-buy-and-sell-stock',
        'maximum-subarray',
        'longest-substring-without-repeating-characters',
        'coin-change',
        'number-of-islands',
        'climbing-stairs',
        'trapping-rain-water',
        'merge-intervals',
      ]),
    },
    {
      slug: 'faang-fintech-product-track',
      title: 'Product & FinTech Track (Amazon, Google, Microsoft)',
      description: 'High-yield problems asked in online assessments and technical rounds at Amazon, Google, Microsoft, and Morgan Stanley.',
      category: 'FAANG',
      icon: 'Award',
      problemSlugs: JSON.stringify([
        'two-sum',
        'valid-parentheses',
        'longest-substring-without-repeating-characters',
        'coin-change',
        'number-of-islands',
        'trapping-rain-water',
        'merge-intervals',
        'kth-largest-element-in-an-array',
      ]),
    },
  ];

  for (const sheet of sheetsData) {
    await prisma.sheet.upsert({
      where: { slug: sheet.slug },
      update: { ...sheet },
      create: { ...sheet },
    });
  }

  // 4. Mock Assessments
  const assessmentData = [
    {
      title: 'TCS NQT National Qualifier Mock Test (2026)',
      company: 'TCS NQT',
      durationMinutes: 45,
      totalMarks: 100,
      description: 'Simulated 45-minute coding round for TCS NQT / TCS Prime. Tests Array manipulation and Dynamic Programming.',
      instructions: 'You have 45 minutes to solve 2 questions. Both sample and private testcases will be evaluated. Do not switch tabs.',
      problemSlugs: ['two-sum', 'maximum-subarray'],
    },
    {
      title: 'Amazon SDE Online Assessment (OA 2026)',
      company: 'Amazon OA',
      durationMinutes: 70,
      totalMarks: 100,
      description: 'Simulated 70-minute Amazon Online Assessment with sliding window and graph traversal challenges.',
      instructions: 'Solve 2 algorithmic problems within 70 minutes. Full test suite validation required for all marks.',
      problemSlugs: ['longest-substring-without-repeating-characters', 'number-of-islands'],
    },
    {
      title: 'Infosys Specialist Programmer Mock (DPhi / HackWithInfy)',
      company: 'Infosys DPhi',
      durationMinutes: 90,
      totalMarks: 150,
      description: 'Advanced 90-minute competitive mock test featuring Dynamic Programming, Two Pointers, and Stack.',
      instructions: 'Contains 3 questions of varying difficulties (Easy, Medium, Hard). Optimal time and space complexity required.',
      problemSlugs: ['valid-parentheses', 'coin-change', 'trapping-rain-water'],
    },
  ];

  for (const item of assessmentData) {
    let existingAssessment = await prisma.assessment.findFirst({
      where: { title: item.title },
    });

    if (!existingAssessment) {
      existingAssessment = await prisma.assessment.create({
        data: {
          title: item.title,
          company: item.company,
          durationMinutes: item.durationMinutes,
          totalMarks: item.totalMarks,
          description: item.description,
          instructions: item.instructions,
        },
      });
    }

    await prisma.assessmentProblem.deleteMany({
      where: { assessmentId: existingAssessment.id },
    });

    let order = 1;
    for (const slug of item.problemSlugs) {
      const prob = await prisma.problem.findUnique({ where: { slug } });
      if (prob) {
        await prisma.assessmentProblem.create({
          data: {
            assessmentId: existingAssessment.id,
            problemId: prob.id,
            points: Math.floor(item.totalMarks / item.problemSlugs.length),
            order: order++,
          },
        });
      }
    }
  }

  console.log('✅ Campus Bridge Database seeded with pure LeetCode signatures!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
