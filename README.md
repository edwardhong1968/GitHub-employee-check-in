# GitHub Employee Check-in

📋 員工打卡系統 Demo  
前端掃描 QR Code 打卡，後端 Node.js 將打卡紀錄直接更新至 GitHub CSV。

---

## 專案內容

- **前端**  
  - `index.html`：主頁面，提供 QR Code 掃描與打卡按鈕  
  - `style.css`：頁面樣式  
  - `app.js`：前端打卡邏輯與 API 呼叫  

- **後端**  
  - `server.js`：Node.js 打卡 API，將紀錄寫入 GitHub CSV  
  - 依賴套件：`express`、`cors`、`node-fetch`、`dotenv`  

- **專案設定**  
  - `package.json` / `package-lock.json`：Node.js 專案依賴  
  - `.gitignore`：忽略 `.env`、`node_modules` 等敏感檔案  

---

## 安裝與使用

### 1️⃣ Clone 專案

```bash
git clone https://github.com/edwardhong1968/GitHub-employee-check-in.git
cd GitHub-employee-check-in
