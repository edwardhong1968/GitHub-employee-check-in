<<<<<<< HEAD
﻿let isSubmitting = false;

const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

// 員工編號對應表
const employeeMap = {
  "123456": "周",
  "234567": "洪",
  "345678": "徐",
  "456789": "蔡",
  "567890": "李"
};

function onScanSuccess(decodedText) {
  if (isSubmitting) return;
  isSubmitting = true;

  const input = decodedText.trim();
  let employeeId = input;
  let employeeName = employeeMap[input] || input;

  if (!employeeName) {
    statusEl.textContent = "未知員工，請重試";
    statusEl.className = "status error";
    restartBtn.hidden = false;
    return;
  }

  statusEl.textContent = "打卡中...";
  statusEl.className = "status";

  // 呼叫後端打卡 API
  fetch("http://localhost:3000/api/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, name: employeeName })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        statusEl.textContent = data.message;
        statusEl.className = "status success";
      } else {
        statusEl.textContent = "打卡失敗，請重試";
        statusEl.className = "status error";
      }
      restartBtn.hidden = false;
    })
    .catch(err => {
      console.error(err);
      statusEl.textContent = "打卡失敗，請重試";
      statusEl.className = "status error";
      restartBtn.hidden = false;
    });
}

// 初始化掃描器
const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 220 },
  onScanSuccess
);

// 重新掃描按鈕
restartBtn.onclick = () => {
  isSubmitting = false;
  restartBtn.hidden = true;
  statusEl.textContent = "等待掃描...";
  statusEl.className = "status";

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 220 },
    onScanSuccess
  );
};

// 下載打卡紀錄按鈕
document.getElementById("downloadBtn").onclick = () => {
  window.open("http://localhost:3000/api/download", "_blank");
};
=======
﻿let isSubmitting = false;

const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");

// 員工編號對應表
const employeeMap = {
  "123456": "周",
  "234567": "洪",
  "345678": "徐",
  "456789": "蔡",
  "567890": "李"
};

function onScanSuccess(decodedText) {
  if (isSubmitting) return;
  isSubmitting = true;

  const input = decodedText.trim();
  let employeeId = input;
  let employeeName = employeeMap[input] || input;

  if (!employeeName) {
    statusEl.textContent = "未知員工，請重試";
    statusEl.className = "status error";
    restartBtn.hidden = false;
    return;
  }

  statusEl.textContent = "打卡中...";
  statusEl.className = "status";

  // 呼叫後端打卡 API
  fetch("http://localhost:3000/api/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, name: employeeName })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        statusEl.textContent = data.message;
        statusEl.className = "status success";
      } else {
        statusEl.textContent = "打卡失敗，請重試";
        statusEl.className = "status error";
      }
      restartBtn.hidden = false;
    })
    .catch(err => {
      console.error(err);
      statusEl.textContent = "打卡失敗，請重試";
      statusEl.className = "status error";
      restartBtn.hidden = false;
    });
}

// 初始化掃描器
const html5QrCode = new Html5Qrcode("reader");
html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 220 },
  onScanSuccess
);

// 重新掃描按鈕
restartBtn.onclick = () => {
  isSubmitting = false;
  restartBtn.hidden = true;
  statusEl.textContent = "等待掃描...";
  statusEl.className = "status";

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 220 },
    onScanSuccess
  );
};

// 下載打卡紀錄按鈕
document.getElementById("downloadBtn").onclick = () => {
  window.open("http://localhost:3000/api/download", "_blank");
};
>>>>>>> 8f9a0f11e1d070087b09877468afd24450a9da07
