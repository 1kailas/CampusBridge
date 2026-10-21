export interface DriverDefinition {
  methodName: string;
  pythonDriver: (userCode: string) => string;
  cppDriver: (userCode: string) => string;
  javaDriver: (userCode: string) => string;
  jsDriver: (userCode: string) => string;
}

export const PROBLEM_DRIVERS: Record<string, DriverDefinition> = {
  'two-sum': {
    methodName: 'twoSum',
    pythonDriver: (code) => `
import sys, json
from typing import List, Optional, Dict, Tuple

${code}

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        target = int(lines[1])
        sol = Solution()
        res = sol.twoSum(nums, target)
        print(json.dumps(res))
`,
    cppDriver: (code) => `
#include <iostream>
#include <vector>
#include <unordered_map>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

${code}

int main() {
    string line;
    if (getline(cin, line)) {
        vector<int> nums;
        string n = "";
        for (char c : line) {
            if ((c >= '0' && c <= '9') || c == '-') n += c;
            else if (!n.empty()) { nums.push_back(stoi(n)); n = ""; }
        }
        if (!n.empty()) { nums.push_back(stoi(n)); n = ""; }
        int target;
        if (cin >> target) {
            Solution sol;
            auto res = sol.twoSum(nums, target);
            cout << "[" << res[0] << "," << res[1] << "]" << endl;
        }
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replace("[", "").replace("]", "").replace(" ", "");
            String[] parts = line.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
            int target = sc.nextInt();
            Solution sol = new Solution();
            int[] res = sol.twoSum(nums, target);
            System.out.println("[" + res[0] + "," + res[1] + "]");
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
    const nums = JSON.parse(input[0]);
    const target = parseInt(input[1]);
    const fn = typeof twoSum !== 'undefined' ? twoSum : (new Solution()).twoSum;
    console.log(JSON.stringify(fn(nums, target)));
}
`,
  },

  'valid-parentheses': {
    methodName: 'isValid',
    pythonDriver: (code) => `
import sys
from typing import List

${code}

if __name__ == '__main__':
    s = sys.stdin.read().strip().replace('"', '').replace("'", "")
    sol = Solution()
    print("true" if sol.isValid(s) else "false")
`,
    cppDriver: (code) => `
#include <iostream>
#include <string>
#include <stack>
using namespace std;

${code}

int main() {
    string s;
    if (cin >> s) {
        if (s.front() == '"' && s.back() == '"') s = s.substr(1, s.length() - 2);
        Solution sol;
        cout << (sol.isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next().replace("\\\"", "");
            Solution sol = new Solution();
            System.out.println(sol.isValid(s) ? "true" : "false");
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim().replace(/['"]/g, '');
const fn = typeof isValid !== 'undefined' ? isValid : (new Solution()).isValid;
console.log(fn(input) ? "true" : "false");
`,
  },

  'best-time-to-buy-and-sell-stock': {
    methodName: 'maxProfit',
    pythonDriver: (code) => `
import sys, json
from typing import List

${code}

if __name__ == '__main__':
    line = sys.stdin.read().strip()
    if line:
        prices = json.loads(line)
        sol = Solution()
        print(sol.maxProfit(prices))
`,
    cppDriver: (code) => `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

${code}

int main() {
    string line;
    if (getline(cin, line)) {
        vector<int> prices;
        string n = "";
        for (char c : line) {
            if (c >= '0' && c <= '9') n += c;
            else if (!n.empty()) { prices.push_back(stoi(n)); n = ""; }
        }
        if (!n.empty()) { prices.push_back(stoi(n)); n = ""; }
        Solution sol;
        cout << sol.maxProfit(prices) << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replace("[", "").replace("]", "").replace(" ", "");
            String[] parts = line.split(",");
            int[] prices = new int[parts.length];
            for (int i = 0; i < parts.length; i++) prices[i] = Integer.parseInt(parts[i].trim());
            Solution sol = new Solution();
            System.out.println(sol.maxProfit(prices));
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    const prices = JSON.parse(input);
    const fn = typeof maxProfit !== 'undefined' ? maxProfit : (new Solution()).maxProfit;
    console.log(fn(prices));
}
`,
  },

  'maximum-subarray': {
    methodName: 'maxSubArray',
    pythonDriver: (code) => `
import sys, json
from typing import List

${code}

if __name__ == '__main__':
    line = sys.stdin.read().strip()
    if line:
        nums = json.loads(line)
        sol = Solution()
        print(sol.maxSubArray(nums))
`,
    cppDriver: (code) => `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

${code}

int main() {
    string line;
    if (getline(cin, line)) {
        vector<int> nums;
        string n = "";
        for (char c : line) {
            if ((c >= '0' && c <= '9') || c == '-') n += c;
            else if (!n.empty()) { nums.push_back(stoi(n)); n = ""; }
        }
        if (!n.empty()) { nums.push_back(stoi(n)); n = ""; }
        Solution sol;
        cout << sol.maxSubArray(nums) << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replace("[", "").replace("]", "").replace(" ", "");
            String[] parts = line.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
            Solution sol = new Solution();
            System.out.println(sol.maxSubArray(nums));
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    const nums = JSON.parse(input);
    const fn = typeof maxSubArray !== 'undefined' ? maxSubArray : (new Solution()).maxSubArray;
    console.log(fn(nums));
}
`,
  },

  'longest-substring-without-repeating-characters': {
    methodName: 'lengthOfLongestSubstring',
    pythonDriver: (code) => `
import sys

${code}

if __name__ == '__main__':
    s = sys.stdin.read().rstrip('\\r\\n')
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1]
    sol = Solution()
    print(sol.lengthOfLongestSubstring(s))
`,
    cppDriver: (code) => `
#include <iostream>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

${code}

int main() {
    string s;
    if (getline(cin, s)) {
        if (s.front() == '"' && s.back() == '"') s = s.substr(1, s.length() - 2);
        Solution sol;
        cout << sol.lengthOfLongestSubstring(s) << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine().replace("\\\"", "");
            Solution sol = new Solution();
            System.out.println(sol.lengthOfLongestSubstring(s));
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim().replace(/['"]/g, '');
const fn = typeof lengthOfLongestSubstring !== 'undefined' ? lengthOfLongestSubstring : (new Solution()).lengthOfLongestSubstring;
console.log(fn(input));
`,
  },

  'coin-change': {
    methodName: 'coinChange',
    pythonDriver: (code) => `
import sys, json
from typing import List

${code}

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        coins = json.loads(lines[0])
        amount = int(lines[1])
        sol = Solution()
        print(sol.coinChange(coins, amount))
`,
    cppDriver: (code) => `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

${code}

int main() {
    string line;
    if (getline(cin, line)) {
        vector<int> coins;
        string n = "";
        for (char c : line) {
            if (c >= '0' && c <= '9') n += c;
            else if (!n.empty()) { coins.push_back(stoi(n)); n = ""; }
        }
        if (!n.empty()) { coins.push_back(stoi(n)); n = ""; }
        int amount;
        cin >> amount;
        Solution sol;
        cout << sol.coinChange(coins, amount) << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replace("[", "").replace("]", "").replace(" ", "");
            String[] parts = line.split(",");
            int[] coins = new int[parts.length];
            for (int i = 0; i < parts.length; i++) coins[i] = Integer.parseInt(parts[i].trim());
            int amount = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.coinChange(coins, amount));
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
    const coins = JSON.parse(input[0]);
    const amount = parseInt(input[1]);
    const fn = typeof coinChange !== 'undefined' ? coinChange : (new Solution()).coinChange;
    console.log(fn(coins, amount));
}
`,
  },

  'number-of-islands': {
    methodName: 'numIslands',
    pythonDriver: (code) => `
import sys, json
from typing import List

${code}

if __name__ == '__main__':
    content = sys.stdin.read().strip()
    if content:
        grid = json.loads(content)
        sol = Solution()
        print(sol.numIslands(grid))
`,
    cppDriver: (code) => `
#include <iostream>
#include <vector>
#include <string>
using namespace std;

${code}

int main() {
    vector<vector<char>> grid;
    vector<char> row;
    char c;
    bool inRow = false;
    while (cin.get(c)) {
        if (c == '[') {
            row.clear();
            inRow = true;
        } else if (c == ']') {
            if (inRow && !row.empty()) {
                grid.push_back(row);
                row.clear();
            }
            inRow = false;
        } else if (c == '0' || c == '1') {
            row.push_back(c);
        }
    }
    Solution sol;
    cout << sol.numIslands(grid) << endl;
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        StringBuilder sb = new StringBuilder();
        while (sc.hasNextLine()) {
            sb.append(sc.nextLine()).append((char) 10);
        }
        String text = sb.toString();
        List<char[]> rows = new ArrayList<>();
        int start = -1;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '[') {
                start = i;
            } else if (c == ']' && start != -1) {
                String sub = text.substring(start + 1, i);
                String clean = sub.replaceAll("[^01]", "");
                if (!clean.isEmpty()) {
                    rows.add(clean.toCharArray());
                }
                start = -1;
            }
        }
        if (!rows.isEmpty()) {
            char[][] grid = rows.toArray(new char[rows.size()][]);
            Solution sol = new Solution();
            System.out.println(sol.numIslands(grid));
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    const grid = JSON.parse(input);
    const fn = typeof numIslands !== 'undefined' ? numIslands : (new Solution()).numIslands;
    console.log(fn(grid));
}
`,
  },

  'climbing-stairs': {
    methodName: 'climbStairs',
    pythonDriver: (code) => `
import sys

${code}

if __name__ == '__main__':
    line = sys.stdin.read().strip()
    if line:
        sol = Solution()
        print(sol.climbStairs(int(line)))
`,
    cppDriver: (code) => `
#include <iostream>
using namespace std;

${code}

int main() {
    int n;
    if (cin >> n) {
        Solution sol;
        cout << sol.climbStairs(n) << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            Solution sol = new Solution();
            System.out.println(sol.climbStairs(sc.nextInt()));
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    const fn = typeof climbStairs !== 'undefined' ? climbStairs : (new Solution()).climbStairs;
    console.log(fn(parseInt(input)));
}
`,
  },

  'trapping-rain-water': {
    methodName: 'trap',
    pythonDriver: (code) => `
import sys, json
from typing import List

${code}

if __name__ == '__main__':
    line = sys.stdin.read().strip()
    if line:
        height = json.loads(line)
        sol = Solution()
        print(sol.trap(height))
`,
    cppDriver: (code) => `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

${code}

int main() {
    string line;
    if (getline(cin, line)) {
        vector<int> height;
        string n = "";
        for (char c : line) {
            if (c >= '0' && c <= '9') n += c;
            else if (!n.empty()) { height.push_back(stoi(n)); n = ""; }
        }
        if (!n.empty()) { height.push_back(stoi(n)); n = ""; }
        Solution sol;
        cout << sol.trap(height) << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replace("[", "").replace("]", "").replace(" ", "");
            String[] parts = line.split(",");
            int[] h = new int[parts.length];
            for (int i = 0; i < parts.length; i++) h[i] = Integer.parseInt(parts[i].trim());
            Solution sol = new Solution();
            System.out.println(sol.trap(h));
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    const fn = typeof trap !== 'undefined' ? trap : (new Solution()).trap;
    console.log(fn(JSON.parse(input)));
}
`,
  },

  'merge-intervals': {
    methodName: 'merge',
    pythonDriver: (code) => `
import sys, json
from typing import List

${code}

if __name__ == '__main__':
    line = sys.stdin.read().strip()
    if line:
        intervals = json.loads(line)
        sol = Solution()
        print(json.dumps(sol.merge(intervals)))
`,
    cppDriver: (code) => `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

${code}

int main() {
    string line;
    if (getline(cin, line)) {
        vector<vector<int>> intervals;
        vector<int> current;
        string n = "";
        for (char c : line) {
            if (c >= '0' && c <= '9') n += c;
            else if (!n.empty()) {
                current.push_back(stoi(n));
                n = "";
                if (current.size() == 2) {
                    intervals.push_back(current);
                    current.clear();
                }
            }
        }
        Solution sol;
        auto res = sol.merge(intervals);
        cout << "[";
        for (size_t i = 0; i < res.size(); ++i) {
            cout << "[" << res[i][0] << "," << res[i][1] << "]";
            if (i + 1 < res.size()) cout << ",";
        }
        cout << "]" << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine();
            List<int[]> list = new ArrayList<>();
            line = line.replaceAll("\\s+", "");
            line = line.replace("[[", "").replace("]]", "");
            String[] pairs = line.split("\\\\],\\\\[");
            for (String p : pairs) {
                String[] vals = p.split(",");
                if (vals.length == 2) {
                    list.add(new int[]{Integer.parseInt(vals[0].trim()), Integer.parseInt(vals[1].trim())});
                }
            }
            Solution sol = new Solution();
            int[][] res = sol.merge(list.toArray(new int[list.size()][]));
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < res.length; i++) {
                sb.append("[").append(res[i][0]).append(",").append(res[i][1]).append("]");
                if (i + 1 < res.length) sb.append(",");
            }
            sb.append("]");
            System.out.println(sb.toString());
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
    const fn = typeof merge !== 'undefined' ? merge : (new Solution()).merge;
    console.log(JSON.stringify(fn(JSON.parse(input))));
}
`,
  },

  'kth-largest-element-in-an-array': {
    methodName: 'findKthLargest',
    pythonDriver: (code) => `
import sys, json, heapq
from typing import List

${code}

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        nums = json.loads(lines[0])
        k = int(lines[1])
        sol = Solution()
        print(sol.findKthLargest(nums, k))
`,
    cppDriver: (code) => `
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

${code}

int main() {
    string line;
    if (getline(cin, line)) {
        vector<int> nums;
        string n = "";
        for (char c : line) {
            if ((c >= '0' && c <= '9') || c == '-') n += c;
            else if (!n.empty()) { nums.push_back(stoi(n)); n = ""; }
        }
        if (!n.empty()) { nums.push_back(stoi(n)); n = ""; }
        int k;
        cin >> k;
        Solution sol;
        cout << sol.findKthLargest(nums, k) << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replace("[", "").replace("]", "").replace(" ", "");
            String[] parts = line.split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
            int k = sc.nextInt();
            Solution sol = new Solution();
            System.out.println(sol.findKthLargest(nums, k));
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
    const nums = JSON.parse(input[0]);
    const k = parseInt(input[1]);
    const fn = typeof findKthLargest !== 'undefined' ? findKthLargest : (new Solution()).findKthLargest;
    console.log(fn(nums, k));
}
`,
  },

  'valid-palindrome': {
    methodName: 'isPalindrome',
    pythonDriver: (code) => `
import sys

${code}

if __name__ == '__main__':
    s = sys.stdin.read().rstrip('\\r\\n')
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1]
    sol = Solution()
    print("true" if sol.isPalindrome(s) else "false")
`,
    cppDriver: (code) => `
#include <iostream>
#include <string>
#include <cctype>
using namespace std;

${code}

int main() {
    string s;
    if (getline(cin, s)) {
        if (s.front() == '"' && s.back() == '"') s = s.substr(1, s.length() - 2);
        Solution sol;
        cout << (sol.isPalindrome(s) ? "true" : "false") << endl;
    }
    return 0;
}
`,
    javaDriver: (code) => `
import java.util.*;

${code}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            if (s.startsWith("\\\"") && s.endsWith("\\\"")) s = s.substring(1, s.length() - 1);
            Solution sol = new Solution();
            System.out.println(sol.isPalindrome(s) ? "true" : "false");
        }
    }
}
`,
    jsDriver: (code) => `
const fs = require('fs');

${code}

const input = fs.readFileSync(0, 'utf-8').trim();
const fn = typeof isPalindrome !== 'undefined' ? isPalindrome : (new Solution()).isPalindrome;
console.log(fn(input) ? "true" : "false");
`,
  },
};
