---
outline: 'deep'
---

# 数组

数组也是数据呈线性排列的一种数据结构。和链表不同的是，在数组中，访问数据十分简单，而添加和删除数据比较耗工夫。

<p align="center">
<img src="https://wozien-cloud-oss.oss-cn-shenzhen.aliyuncs.com/images/blog/Snipaste_2022-10-17_13-37-28.png" width="200"/>
</p>

另外，数组还有如下几个特点：
- 数据按顺序存储在内存的连续空间内
- 访问数据可以通过数组索引下标访问，时间为 `O(1)`
- 添加和删除数据需要频繁移动数据， 时间为 `O(n)`

## 双指针技巧

数组算法常用的技巧有左右指针和快慢指针。这里的指针是指数组索引，而非真正的指针类型。

### 快慢指针

所谓快慢指针，就是两个指针同向而行，一快一慢。该技巧常用在对数组进行原地修改的场景。其中 `滑动窗口` 类型具有快慢指针的特性。

[:point_right: lc-26. 删除有序数组中的重复项](https://leetcode.cn/problems/remove-duplicates-from-sorted-array/)

::: details :bulb: 思路

让快指针 `fast` 不断遍历去找一个不等于慢指针 `slow` 的数， 然后赋值给 `slow，` 最后得到的 `nums[0...slow]` 就是去重后的数据

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) { 
    let slow = fast = 0

    while(fast < nums.length) {
        if(nums[fast] !== nums[slow]) {
            nums[++slow] = nums[fast]
        }
        fast++
    }

    return slow + 1
};
```

::: tip
对于删除重复元素的链表也可以用类似思路解决，不一样的只是赋值的方式改为指针修改。如 [83. 删除排序链表中的重复元素](https://leetcode.cn/problems/remove-duplicates-from-sorted-list/)
:::

[:point_right: lc-27. 移除元素](https://leetcode.cn/problems/remove-element/)

::: details :bulb: 思路
让快指针 `fast` 不断遍历去找一个不等于 `val` 的数， 然后赋值给 `slow，` 最后得到的 `nums[0...slow]` 就是去重后的数据

```js
var removeElement = function(nums, val) {
    let slow = fast = 0
    while(fast < nums.length) {
        if(nums[fast] !== val) {
            nums[slow] = nums[fast]
            slow++
        }
        fast++
    }
    return slow 
};
```
:::

### 左右指针

所谓左右指针，就是两个指针相向而行或者相背而行。 其中常见的二分查找也属于左右指针。

[:point_right: lc-167. 两数之和 II](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted/)

::: details :bulb: 思路
因为数组是有序的，所以很容易想到左右指针。不断左右缩小范围，知道找出等于 `target` 的两个数

```js
/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(numbers, target) {
    let start = 0, end  = numbers.length - 1
    while(start < end) {
        if(numbers[start] + numbers[end] < target) start++
        else if(numbers[start] + numbers[end] > target) end--;
        else break;
    }
    
    return start < end ? [start+1, end + 1] : []
};
```
:::

[:point_right: lc-5. 最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/)

::: details :bulb: 思路
正常思路就是先实现一个判断是否回文串的函数:
```ts
function isPalindrome(s: string) {
    let l = 0, r = s.length - 1
    while(l < r) {
        if(s[l] !== s[r]) return false;
        l++; r--;
    }
    return true;
}
```
然后再暴力枚举所有字串进行判断，但是这样处理的时间为 `O(n^3)`。更优的方法是实现一个求以 `[l,r]` 为中心的最长回文串函数：

```ts
function palindrome(s: string, l: number, r: number) {
    while(l >= 0 && r < s.length && s[l] === s[r]) {
        l--; r++;
    } 
    return s.substring(l+1, r);
}
```

所以当传入的 `l = r` 的时候就是求出最长的奇数回文串， 当 `l = r + 1` 时，就是求出最长的偶数回文串。最后遍历源字符串进行判断即可，时间为 `O(n^2)`:

```ts
function longestPalindrome(s: string): string {
    let res = '';
    for(let i = 0; i < s.length; i++) {
        const s1 = palindrome(s, i , i);
        const s2 = palindrome(s, i, i + 1);

        res = res.length < s1.length ? s1 : res;
        res = res.length < s2.length ? s2 : res;
    }

    return res;
};
```
:::

## 二分查找

二分查找是通过不断对半切分数组搜索范围，从而搜索目标数据的一种查找方式。如果把二分后的两个搜索区间作为原区间的两个子节点，于是所有搜索区间可以构成一个二叉树。容易得出二分查找的时间复杂度为 `O(logn)`。 

二分查找的难点在于一些细节点上，比如 `while` 里面是用 `<=` 还是 `<`， `mid` 是要加一还是减一。

一个标准的查找就是在一个升序数组中查找一个数并返回下标，数组的元素都是不重复的：

```js
var binSearch = function(nums, target) {
    let l = 0, r = nums.length - 1
    while(l <= r) {
        let m = (l + r) >> 1
        if(nums[m] === target) {
            return m
        } else if(nums[m] < target) {
            l = m + 1
        } else {
            r = m - 1
        }
    }
    return -1
};
```

- 终止条件为啥是 `l<=r` ? 可以是 `l<r` 吗？

  答： 因为搜索区间是一个两端的闭区间 `[l, r]`, 对于两端相等的闭区间比如 [3,3] 也是一个合法的搜索区间。可以写成 `l<r` 作为终止条件， 但是要对遗漏的情况进行处理：
  ```js
  return nums[l] === target ? l : -1
  ```
- 为啥 `l=m+1` 和 `r=m-`1 呢？

  答： 因为在确认 mid 对应的数不是目标时候，就可以排除了。于是搜索区间去就切割为` [l, mid - 1]` 和 `[mid + 1, r]`

::: tip 注意 :ok_man:
以上的查找是针对数组元素不重复的情况。如果对于存在重复元素的数组，要查找一个元素并返回最小或者最大的索引时，这种标准的查找就不适用了，需要加多一些细节处理。
:::

[:point_right: lc-34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)

::: details :bulb: 思路
首先实现一个二分查找左边界的函数：
```js
var searchLeft = function(nums, target) {
    let left = 0, right = nums.length
    while(left < right) {
        const mid = (left + right) >> 1

        if(nums[mid] < target) {
            left = mid + 1
        } else if(nums[mid] > target) {
            right = mid
        } else if(nums[mid] === target) {
            // 不断缩小右边界
            right = mid
        }
    }
    
    // 返回结果为right也行，因为 left=right
    if(left === nums.length) return -1
    return nums[left] === target ? left : -1
}
```

这个二分函数有以下几个细节：

- 因为的我们搜索区间是 `[left, right)` 左闭右开的， 所以 `while` 的合法条件为 `l < r`
- 在 `mid` 为 `target` 值时候， 让 `right = mid` 不断缩小结果的右边界。也可以这么理解，因为我们查找的是 `target` 的左边界， 正确的结果要么是 `mid`， 要么肯定在左区间 `[left, mid)`。 
- 因为循环的终止条件是 `left=right`， 所以要考虑索引溢出的情况

同样的，我们可以实现一个查找右边界的二分查找函数：

```js
var searchRight = function(nums, target) {
    let left = 0, right = nums.length
    while(left < right) {
        const mid = (left + right) >> 1

        if(nums[mid] < target) {
            left = mid + 1
        } else if(nums[mid] > target) {
            right = mid
        } else if(nums[mid] === target) {
            left = mid + 1
        }
    }

    if(left - 1 < 0) return -1
    return nums[left - 1] === target ? left - 1 : -1
}
```

和查找左边界不同的是：
- 当 nums[mid] === target 时候， 让 `left = mid + 1` 不断缩小左边界
- 因为 `left = mid + 1` 时候，假如 `mid` 为正确的右边界索引，这个时候 `left` 就不是正确值了，于是可知返回结果为 `left - 1`

最终调用这两个函数返回结果即可：
```js
var searchRange = function(nums, target) {
    return [searchLeft(nums, target), searchRight(nums, target)]
};

```
:::

## 滑动窗口

滑动窗口是一类比较难掌握的数组双指针技巧，这类算法一般用在字符串相关问题上。主要流程就是通过不断增加右指针 `right` 将字符加进当前窗口，在满足某些条件下通过 `left++` 缩小窗口并计算最优化，可以用下面的伪代码表示：

```ts
function slidingWindow(s: string) {
  let left = right = 0

  while(right < s.length) {
    // 待移入窗口的字符
    let c = s[right]
    right++

    // 1.对移入窗口字符的一些相关处理

   // 2.对是否需要缩小窗口的判断
    while(window.needRemove()) {
      // 3. 记录结果

      // 移出窗口的字符
      c = s[left]
      left++

      // 4.对移出窗口字符的一些相关处理
    }
  }
}

```

结合算法结构总结下滑动窗口的几个特点：

- 增大窗口一般是为了满足条件， 缩小窗口一般是为了得出最优价
- 一般 `1` 和 `4` 对字符的移入和移出的数据操作是对称。
- 每个字符顶多移入和移出窗口1次，所以时间负责度为 `O(n)`。

[:point_right: lc-76. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)

::: details :bulb: 思路

很显然这道题可以用滑动窗口解决。用right指针不断前进，算出当前窗口的字串是否满足条件。在满足条件的情况下不断缩小窗口计算最小长度的字串。那怎么判断当前窗口的字串满足条件呢？

- 用 `need` 表示目标串每个字符出现的次数， 用 `win` 对象表示此时窗口中字符的个数
- 通过对比 `win` 和 `need` 的字符的次数情况得出是否需要缩小窗口

```js
/**
 * @param {string} s
 * @param {string} t
 * @return {string}
 */
var minWindow = function(s, t) {
    if(s.length < t.length) return ''
    let need = {}, win = {}
    let left = right = 0, valid = 0
    let start = 0, len = Infinity

    for(let c of t) need[c] = (need[c] || 0) + 1
    let count = Object.keys(need).length

    while(right < s.length) {
        let c = s[right]
        right++
        if(need[c]) {
            win[c] = (win[c] || 0) + 1
            if(win[c] === need[c]) valid++
        }
        
        // 所需字符的次数相等
        while(valid === count) {
            if(right - left < len) {
                start = left
                len = right - left
            }
            c = s[left]
            left++
            if(need[c]) {
                if(win[c] === need[c]) valid--
                win[c]--
            }   
        }
    }

    return len === Infinity ? '' : s.substr(start, len)
};
```
:::

[:point_right: lc-567. 字符串的排列](https://leetcode.cn/problems/permutation-in-string/)

::: details :bulb: 思路

通过比较当前窗口字符出现次数和所以目标串的字符次数来判断是否包含目标串的排列

```js
/**
 * @param {string} s1
 * @param {string} s2
 * @return {boolean}
 */
var checkInclusion = function(s1, s2) {
    let len1 = s1.length, len2 = s2.length
    if(len1 > len2) return false
    let need = {}, win = {}
    let left = right = 0, valid = 0

    for(let c of s1) need[c] = (need[c] || 0) + 1
    let count = Object.keys(need).length

    while(right < len2) {
        let c = s2[right]
        right++
        if(need[c]) {
            win[c] = (win[c] || 0) + 1
            if(win[c] === need[c]) valid++
        }
        // 当字串的长度满足时就应该缩小窗口了
        while(right - left >= len1) {
            if(valid === count) return true
            c = s2[left]
            left++
            if(need[c]) {
                if(win[c] === need[c]) valid--
                win[c]--
            }
        }
    }

    return false
};
```
:::

[:point_right: lc-438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

::: details :bulb: 思路
```js
/**
 * @param {string} s
 * @param {string} p
 * @return {number[]}
 */
var findAnagrams = function(s, p) {
    let len1 = s.length, len2 = p.length
    if(len1 < len2) return []
    let need = {}, win = {}
    let left = right = 0, valid = 0
    
    for(let c of p) need[c] = (need[c] || 0) + 1
    let count = Object.keys(need).length, res = []

    while(right < len1) {
        let c = s[right]
        right++
        if(need[c]) {
            win[c] = (win[c] || 0) + 1
            if(win[c] === need[c]) valid++
        }

        while(right - left >= len2) {
            if(valid === count) res.push(left)
            c = s[left]
            left++
            if(need[c]) {
                if(win[c] === need[c]) valid--
                win[c]--
            }
        }
    }
    return res
};
```
:::

[:point_right: lc-3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

::: details :bulb: 思路

```js
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    let len = s.length
    if(len < 2) return len
    let left = right = res = 0 , win = {}

    while(right < len) {
        let c = s[right]
        right++
        win[c] = (win[c] || 0) + 1

        while(win[c] > 1) {
            let d  = s[left]
            left++
            win[d]--
        }
        res = Math.max(res, right - left)
    }
    return res
};
```
:::
## 前缀和数组

前缀和技巧适用于快速、频繁地计算一个索引区间内的元素之和。

核心流程就是计算一个前缀和数组, `preSum[i]` 等于 `nums[0...i-1]`的和，然后求任意两个索引[l,r] 之间的和就变成了 `preSum[r+1] - preSum[l]`，可以让求和的时间从 `O(n)` 降到 `O(1)`。

<img src="https://labuladong.gitee.io/algo/images/%e5%b7%ae%e5%88%86%e6%95%b0%e7%bb%84/1.jpeg" />

[:point_right: lc-303. 区域和检索 - 数组不可变](https://leetcode.cn/problems/range-sum-query-immutable/)

::: details :bulb: 思路
```js
var NumArray = function(nums) {
    this.nums = nums;
    this.preSum = [0];

    for(let i = 0; i < this.nums.length; i++) {
        this.preSum[i + 1] = this.preSum[i] + this.nums[i]
    }
};

NumArray.prototype.sumRange = function(left, right) {
    return this.preSum[right + 1] - this.preSum[left]
};
```
:::

## 差分数组

差分数组的主要适用场景是频繁对原始数组的某个区间的元素进行增减。

核心流程就是构建一个差分数组， 满足 `diff[i] = nums[i] - nums[i-1]`, 如下：

<img src="https://labuladong.gitee.io/algo/images/%e5%b7%ae%e5%88%86%e6%95%b0%e7%bb%84/2.jpeg" />

差分数组有以下几个特性：

- 可以通过 `diff` 还原原来的数组：
  ```js
  const nums = [diff[0]]
  for(let i = 1; i < diff.length; i++) {
    res[i] = res[i - 1] + diff[i]
  }
  ```

- 对 `nums[i...j]` 范围的数加 `val`， 等于 `diff[i] += val, diff[j+1] -= val`

综合上面两个特点，对数组的一定范围数据的加减就可以转化为对差分数组两个数据的加减了，时间从  `O(n)` 降到 `O(1)`。

[:point_right: lc-1109. 航班预订统计](https://leetcode.cn/problems/corporate-flight-bookings/)

::: details :bulb: 思路
利用差分数组的特性进行优化
```js
/**
 * @param {number[][]} bookings
 * @param {number} n
 * @return {number[]}
 */
var corpFlightBookings = function(bookings, n) {
    const diff = Array(n).fill(0)
    for(let [i, j, val] of bookings) {
        diff[i-1] += val
        if(j < n) diff[j] -= val
    }
    const res = [diff[0]]
    for(let i = 1; i < n; i++) {
        res[i] = res[i - 1] + diff[i]
    }
    return res
};
```
:::

## 参考

[labuladong 手把手刷数组算法](https://labuladong.gitee.io/algo/2/20/)