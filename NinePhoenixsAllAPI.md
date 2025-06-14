# 用户模块
### 1.登录POST
#### 请求curl：
```bash
curl --location 'http://localhost:8082/algo/v1/user/login' \
--header 'Content-Type: text/plain' \
--data-raw '{
  "email": "tengzj@example.com",
  "password": "12345678"
}'
```

#### 输入JSON：
```bash
{
  "email": "tengzj@example.com",
  "password": "12345678"
}
```

#### 输出JSON：
```bash
{
    "code": 0,
    "message": "成功",
    "data": {
        "user": {
            "id": 2,
            "username": "tengzj",
            "email": "tengzj@example.com"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMjU2MjMsImlhdCI6MTc0OTEzOTIyM30.wUyI7UKCDvf0aSr1u1mAjHyCFMtPLzipgJ-RxSGY8_Y"
    }
}
```





### 2.注册POST
#### 请求curl：
```bash
curl --location 'http://localhost:8082/algo/v1/user/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "username": "ciusyan1",
  "email": "ciusyan1@example.com",
  "password": "123456"
}'
```

#### 输入JSON：
```bash
{
  "username": "ciusyan1",
  "email": "ciusyan1@example.com",
  "password": "123456"
}
```

#### 输出JSON：
```bash
{
    "code": 0,
    "message": "成功",
    "data": {
        "user": {
            "id": 3,
            "username": "ciusyan1",
            "email": "ciusyan1@example.com"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJleHAiOjE3NDkyMjY5OTksImlhdCI6MTc0OTE0MDU5OX0.NyOH3NCoJ0_WOptHp4c5G5pkP0G3eSGKDaLnHkFJJ-k"
    }
}
```







# 计划模块


```plain
// 1.导入测试计划

type ImportPlanRequest struct {
	PlanName          string `json:"plan_name" binding:"required"`
	SourceType        string `json:"source_type" binding:"required,oneof=manual topic_set"`
	StartDate         string `json:"start_date" binding:"required"` // 格式 YYYY-MM-DD
	RepeatStrategyKey string `json:"repeat_strategy_key"`           // 与 customRepeatDays 二选一
	CustomRepeatDays  []int  `json:"custom_repeat_days"`

	// topic_set 模式下
	SourceID int `json:"source_id"`

	// manual 模式下
	QuestionIDs []int `json:"question_ids"`
}

	response.Success(c, gin.H{
		"message":      "计划创建成功",
		"plan_id":      plan.ID,
		"task_summary": summary,
	})

httpser.RegisterRouteWithPolicy(r, httpser.RoutePolicy{
    Method:     http.MethodPost,
    Path:       "/import",
    Handler:    middleware.ExceptionHandler(h.ImportPlan),
    Middleware: httpser.UseGlobalOnly(),
})


curl --location 'http://localhost:8082/algo/v1/plan/import' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMTA5MzAsImlhdCI6MTc0OTEyNDUzMH0.PBk2gvHMU-pSSWbvp8IZYZ1xTZI_7ibu8rqkNcNR-TE' \
--data '{
    "plan_name": "算法入门计划",
    "repeat_key": "default_strategy",
    "source_type":"topic_set",
    "question_ids": [
        4,
        5,
        6
    ],
    "start_date": "2025-06-07"
}'

// 2.日历任务获取

type CalendarTaskGroup struct {
	Date  string             `json:"date"`
	Tasks []CalendarTaskItem `json:"tasks"`
}

GetCalendarTasks(ctx context.Context, userID uint, start, end time.Time) ([]*CalendarTaskGroup, error)

httpser.RegisterRouteWithPolicy(r, httpser.RoutePolicy{
    Method:     http.MethodGet,
    Path:       "/calendar",
    Handler:    middleware.ExceptionHandler(h.GetCalendarTasks),
    Middleware: httpser.UseGlobalOnly(),
})

curl --location 'http://localhost:8082/algo/v1/plan/calendar?start_date=2025-06-06&end_date=2025-06-12' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMTA5MzAsImlhdCI6MTc0OTEyNDUzMH0.PBk2gvHMU-pSSWbvp8IZYZ1xTZI_7ibu8rqkNcNR-TE' \
--header 'Content-Type: application/json'


// 3、获取每日计划

type DayTaskResponse struct {
	Date  string        `json:"date"`
	Tasks []DayTaskItem `json:"tasks"`
}

GetDayTasks(ctx context.Context, userID uint, dateStr string) (*DayTaskResponse, error)

httpser.RegisterRouteWithPolicy(r, httpser.RoutePolicy{
    Method:     http.MethodGet,
    Path:       "/day",
    Handler:    middleware.ExceptionHandler(h.GetDayTasks),
    Middleware: httpser.UseGlobalOnly(),
})

curl --location 'http://localhost:8082/algo/v1/plan/day?date=2025-06-05' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMTA5MzAsImlhdCI6MTc0OTEyNDUzMH0.PBk2gvHMU-pSSWbvp8IZYZ1xTZI_7ibu8rqkNcNR-TE' \
--header 'Content-Type: application/json'


// 4、获取系统内置重复策略

GetRepeatStrategies(ctx context.Context) ([]*RepeatStrategyItem, error)

type RepeatStrategyItem struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	Days []int  `json:"days"`
}

httpser.RegisterRouteWithPolicy(r, httpser.RoutePolicy{
    Method:     http.MethodGet,
    Path:       "/repeat-strategies",
    Handler:    middleware.ExceptionHandler(h.GetRepeatStrategies),
    Middleware: httpser.UseGlobalOnly(),
})

type LibraryQuestionItem struct {
	QuestionID int      `json:"question_id"`
	Title      string   `json:"title"`
	Difficulty string   `json:"difficulty"`
	Tags       []string `json:"tags"`
}

curl --location 'http://localhost:8082/algo/v1/plan/repeat-strategies' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMTA5MzAsImlhdCI6MTc0OTEyNDUzMH0.PBk2gvHMU-pSSWbvp8IZYZ1xTZI_7ibu8rqkNcNR-TE'


// 5、获取题目列表
GetLibraryQuestions(ctx context.Context, tag, difficulty, keyword string) ([]*LibraryQuestionItem, error)

httpser.RegisterRouteWithPolicy(r, httpser.RoutePolicy{
    Method:     http.MethodGet,
    Path:       "/library/list",
    Handler:    middleware.ExceptionHandler(h.GetLibraryQuestions),
    Middleware: httpser.UseGlobalOnly(),
})

curl --location 'http://localhost:8082/algo/v1/plan/library/list' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMTA5MzAsImlhdCI6MTc0OTEyNDUzMH0.PBk2gvHMU-pSSWbvp8IZYZ1xTZI_7ibu8rqkNcNR-TE'

// 6、获取题单列表
GetQuestionSetList(ctx context.Context, page, pageSize int, keyword string) (*QuestionSetListResponse, error)
type QuestionSetListResponse struct {
	Page     int               `json:"page"`
	PageSize int               `json:"page_size"`
	Total    int64             `json:"total"`
	Sets     []QuestionSetItem `json:"sets"`
}

httpser.RegisterRouteWithPolicy(r, httpser.RoutePolicy{
    Method:     http.MethodGet,
    Path:       "/question-set/list",
    Handler:    middleware.ExceptionHandler(h.GetQuestionSetList),
    Middleware: httpser.UseGlobalOnly(),
})

curl --location 'http://localhost:8082/algo/v1/plan/question-set/list' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMTA5MzAsImlhdCI6MTc0OTEyNDUzMH0.PBk2gvHMU-pSSWbvp8IZYZ1xTZI_7ibu8rqkNcNR-TE'


// 获取题单详情(喊李牧列表)
httpser.RegisterRouteWithPolicy(r, httpser.RoutePolicy{
    Method:     http.MethodGet,
    Path:       "/question-set/:id",
    Handler:    middleware.ExceptionHandler(h.GetQuestionSetDetail),
    Middleware: httpser.UseGlobalOnly(),
})

curl --location 'http://localhost:8082/algo/v1/plan/question-set/3' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMTA5MzAsImlhdCI6MTc0OTEyNDUzMH0.PBk2gvHMU-pSSWbvp8IZYZ1xTZI_7ibu8rqkNcNR-TE'

// 获取题目详情
httpser.RegisterRouteWithPolicy(r, httpser.RoutePolicy{
    Method:     http.MethodGet,
    Path:       "/question/:id",
    Handler:    middleware.ExceptionHandler(h.GetQuestionDetail),
    Middleware: httpser.UseGlobalOnly(),
})

curl --location 'http://localhost:8082/algo/v1/plan/question/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMTA5MzAsImlhdCI6MTc0OTEyNDUzMH0.PBk2gvHMU-pSSWbvp8IZYZ1xTZI_7ibu8rqkNcNR-TE'
```

 



```json

```





































# 练题模块
### 1.获取当日任务列表接口GET
#### 请求curl：
```bash
curl --location 'http://localhost:8082/algo/v1/practice/daily-tasks?date=2025-06-05' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMDQzNzIsImlhdCI6MTc0OTExNzk3Mn0.tQaxeIcxkx1flBd2ZABhut1IZ91koiKZQDJGfcsUFS8'
```



#### 输出JSON：
```bash
{
    "code": 0,
    "message": "成功",
    "data": {
        "date": "",
        "tasks": [
            {
                "id": 1,
                "question_id": 1,
                "title": "两数之和",
                "difficulty": "Easy",
                "status": "done"
            },
            {
                "id": 2,
                "question_id": 3,
                "title": "最长连续序列",
                "difficulty": "Medium",
                "status": "todo"
            },
            {
                "id": 5,
                "question_id": 2,
                "title": "字母异位词分组",
                "difficulty": "Medium",
                "status": "todo"
            }
        ]
    }
}
```







### 2.获取题目详细GET
#### 请求curl：
```bash
curl --location 'http://localhost:8082/algo/v1/practice/questions/1' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMDQzNzIsImlhdCI6MTc0OTExNzk3Mn0.tQaxeIcxkx1flBd2ZABhut1IZ91koiKZQDJGfcsUFS8'
```



#### 输出JSON：
```bash
{
    "code": 0,
    "message": "成功",
    "data": {
        "id": 1,
        "title": "两数之和",
        "content": "<p>给定一个整数数组 <code>nums</code>&nbsp;和一个整数目标值 <code>target</code>，请你在该数组中找出 <strong>和为目标值 </strong><em><code>target</code></em>&nbsp; 的那&nbsp;<strong>两个</strong>&nbsp;整数，并返回它们的数组下标。</p>\n\n<p>你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。</p>\n\n<p>你可以按任意顺序返回答案。</p>\n\n<p>&nbsp;</p>\n\n<p><strong class=\"example\">示例 1：</strong></p>\n\n<pre>\n<strong>输入：</strong>nums = [2,7,11,15], target = 9\n<strong>输出：</strong>[0,1]\n<strong>解释：</strong>因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。\n</pre>\n\n<p><strong class=\"example\">示例 2：</strong></p>\n\n<pre>\n<strong>输入：</strong>nums = [3,2,4], target = 6\n<strong>输出：</strong>[1,2]\n</pre>\n\n<p><strong class=\"example\">示例 3：</strong></p>\n\n<pre>\n<strong>输入：</strong>nums = [3,3], target = 6\n<strong>输出：</strong>[0,1]\n</pre>\n\n<p>&nbsp;</p>\n\n<p><strong>提示：</strong></p>\n\n<ul>\n\t<li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>\n\t<li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>\n\t<li><strong>只会存在一个有效答案</strong></li>\n</ul>\n\n<p>&nbsp;</p>\n\n<p><strong>进阶：</strong>你可以想出一个时间复杂度小于 <code>O(n<sup>2</sup>)</code> 的算法吗？</p>\n",
        "difficulty": "Easy",
        "acceptance_rate": 0.550453
    }
}
```



### 3.提交题目POST
#### 请求curl：
```bash
curl --location 'http://localhost:8082/algo/v1/practice/submit' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMDQzNzIsImlhdCI6MTc0OTExNzk3Mn0.tQaxeIcxkx1flBd2ZABhut1IZ91koiKZQDJGfcsUFS8' \
--data '{
    "question_id": 1,
    "task_id": 1,
    "code_content": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
    "language": "javascript"
  }'
```

#### 输入JSON：
```bash
{
    "question_id": 1,
    "task_id": 1,
    "code_content": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
    "language": "javascript"
  }
```

#### 输出JSON：
```bash
{
    "code": 0,
    "message": "成功",
    "data": {
        "id": 4,
        "status": "Accepted",
        "runtime": "100ms",
        "task_done": false
    }
}
```







### 4.获取上一次提交正确的代码GET
#### 请求curl：
```bash
curl --location 'http://localhost:8082/algo/v1/practice/previous-accepted/last?question_id=1&userId=2' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMDg4NTEsImlhdCI6MTc0OTEyMjQ1MX0.vj5T_Xs4uW-cgdWDTCWNrRoyP4I9LzdF66STU0T-vUU'
```



#### 输出JSON：
```bash
{
    "code": 0,
    "message": "成功",
    "data": {
        "submissionId": 4,
        "codeContent": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
        "language": "javascript",
        "status": "Accepted",
        "runtime": "100ms",
        "submitTime": "2025-06-05 16:01:54"
    }
}
```







### 5.获取历史通过的提交记录列表GET
#### 请求curl：
```bash
curl --location 'http://localhost:8082/algo/v1/practice/previous-accepted/list?question_id=1&limit=5' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJleHAiOjE3NDkyMDg4NTEsImlhdCI6MTc0OTEyMjQ1MX0.vj5T_Xs4uW-cgdWDTCWNrRoyP4I9LzdF66STU0T-vUU'
```



#### 输出JSON：
```bash
{
    "code": 0,
    "message": "成功",
    "data": [
        {
            "submissionId": 4,
            "codeContent": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
            "language": "javascript",
            "status": "Accepted",
            "runtime": "100ms",
            "submitTime": "2025-06-05 16:01:54"
        },
        {
            "submissionId": 3,
            "codeContent": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
            "language": "javascript",
            "status": "Accepted",
            "runtime": "100ms",
            "submitTime": "2025-06-05 10:29:11"
        },
        {
            "submissionId": 2,
            "codeContent": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
            "language": "javascript",
            "status": "Accepted",
            "runtime": "92ms",
            "submitTime": "2025-06-05 10:28:44"
        },
        {
            "submissionId": 1,
            "codeContent": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
            "language": "javascript",
            "status": "Accepted",
            "runtime": "100ms",
            "submitTime": "2025-06-05 10:12:18"
        }
    ]
}
```



### 后端定义的响应相关能有助于理解代码：
```bash
// CalendarTaskResponse 日历视图任务响应
type CalendarTaskResponse struct {
	Date  string `json:"date"`  // 日期，格式：2006-01-02
	Count int    `json:"count"` // 当天任务数量
}

// DailyTaskResponse 当日任务列表响应
type DailyTaskResponse struct {
	Date  string     `json:"date"`  // 日期，格式：2006-01-02
	Tasks []TaskItem `json:"tasks"` // 任务列表
}

// TaskItem 任务项
type TaskItem struct {
	ID         uint   `json:"id" gorm:"column:id"`                   // 任务ID
	QuestionID uint   `json:"question_id" gorm:"column:question_id"` // 题目ID
	Title      string `json:"title" gorm:"column:title"`             // 题目标题
	Difficulty string `json:"difficulty" gorm:"column:difficulty"`   // 难度：easy, medium, hard
	Status     string `json:"status" gorm:"column:status"`           // 状态：todo, doing, done
}

// QuestionDetailResponse 题目详情响应
type QuestionDetailResponse struct {
	ID             uint    `json:"id" gorm:"column:id"`                           // 题目ID
	Title          string  `json:"title" gorm:"column:title"`                     // 题目标题
	Content        string  `json:"content" gorm:"column:content"`                 // 题目内容
	Difficulty     string  `json:"difficulty" gorm:"column:difficulty"`           // 难度：easy, medium, hard
	AcceptanceRate float64 `json:"acceptance_rate" gorm:"column:acceptance_rate"` // 通过率
}

// SubmitRequest 提交题目请求
type SubmitRequest struct {
	QuestionID  uint   `json:"question_id" binding:"required"`  // 题目ID
	TaskID      uint   `json:"task_id"`                         // 任务ID，可选
	CodeContent string `json:"code_content" binding:"required"` // 代码内容
	Language    string `json:"language" binding:"required"`     // 编程语言
}

// SubmitResponse 提交题目响应
type SubmitResponse struct {
	ID       uint   `json:"id"`        // 提交记录ID
	Status   string `json:"status"`    // 状态：Accepted, Wrong Answer, Time Limit Exceeded 等
	Runtime  string `json:"runtime"`   // 运行时间
	TaskDone bool   `json:"task_done"` // 任务是否完成
}

// PreviousSubmissionResponse 历史提交记录响应
type PreviousSubmissionResponse struct {
	SubmissionID  uint      `json:"submissionId" gorm:"column:submission_id"` // 提交记录ID
	CodeContent   string    `json:"codeContent" gorm:"column:code_content"`   // 已通过的代码内容
	Language      string    `json:"language" gorm:"column:language"`          // 提交所用的编程语言
	Status        string    `json:"status" gorm:"column:status"`              // 提交结果，如 Accepted
	Runtime       string    `json:"runtime" gorm:"column:runtime"`            // 运行时间/判题耗时
	SubmitTime    time.Time `json:"-" gorm:"column:submit_time"`              // 提交时间（数据库字段）
	SubmitTimeStr string    `json:"submitTime" gorm:"-"`                      // 提交时间字符串，格式 "YYYY-MM-DD HH:mm:ss"
}

```



