const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Node.js CommonJS 正確 fetch 寫法
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ===== GitHub 設定 =====
const OWNER = "edwardhong1968";  // 改成你的帳號
const REPO = "GitHub-employee-check-in";
const FILE_PATH = "checkin_records.csv";
const BRANCH = "main";
const TOKEN = process.env.GITHUB_TOKEN;

// ===== 測試首頁 =====
app.get("/", (req, res) => {
  res.send("Backend is running OK");
});

// ===== 取得 CSV =====
async function getCSVContent() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: { Authorization: `token ${TOKEN}` }
  });
  return res.json();
}

// ===== 更新 CSV =====
async function updateCSV(newContent, sha) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
  const body = {
    message: "Update check-in records",
    content: Buffer.from(newContent).toString("base64"),
    branch: BRANCH,
    sha
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return res.json();
}

// ===== 打卡 API =====
app.post("/api/checkin", async (req, res) => {
  const { employeeId, name } = req.body;
  if (!employeeId || !name) {
    return res.status(400).json({ status: "error", message: "缺少資料" });
  }

  try {
    const data = await getCSVContent();
    const sha = data.sha;
    let csv = Buffer.from(data.content, "base64").toString();

    const now = new Date().toLocaleString("zh-TW");
    csv += `${employeeId},${name},${now}\n`;

    await updateCSV(csv, sha);
    res.json({ status: "success", message: `${name} 打卡完成` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "打卡失敗" });
  }
});

// ===== 下載 CSV =====
app.get("/api/download", async (req, res) => {
  try {
    const data = await getCSVContent();
    const csv = Buffer.from(data.content, "base64").toString();
    res.setHeader("Content-Type", "text/csv;charset=utf-8");
    res.send(csv);
  } catch (err) {
    res.status(500).send("下載失敗");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

