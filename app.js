let isSubmitting = false;

const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const downloadBtn = document.getElementById("downloadBtn");

// 打卡成功提示音
const beepSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

// 員工編號對應表
const employeeMap = {
  "123456": "周",
  "234567": "洪",
  "345678": "徐",
  "456789": "蔡",
  "567890": "李"
};

// 初始化掃描器
const html5QrCode = new Html5Qrcode("reader");

// 掃描成功處理函數
function onScanSuccess(decodedText) {
  if (isSubmitting) return;
  isSubmitting = true;

  const employeeId = decodedText.trim();
  const employeeName = employeeMap[employeeId];

  if (!employeeName) {
    statusEl.textContent = "未知員工，請重試";
    statusEl.className = "status error";
    restartBtn.hidden = false;
    isSubmitting = false;
    return;
  }

  statusEl.textContent = `打卡中... (${employeeName})`;
  statusEl.className = "status";

  fetch("http://localhost:3000/api/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, name: employeeName })
  })
    .then(res => res.json())
    .then(async data => {
      if (data.status === "success") {
        // 成功 → 顯示姓名 + 成功訊息，播放提示音
        statusEl.textContent = `${employeeName} 打卡成功`;
        statusEl.className = "status success";
        beepSound.play();

        // 停止掃描器
        await stopScanner();
      } else {
        // 失敗 → 顯示錯誤，保持掃描器
        statusEl.textContent = `${employeeName} 打卡失敗，請重試`;
        statusEl.className = "status error";
        restartBtn.hidden = false;
        isSubmitting = false; // 允許再次掃描
      }
    })
    .catch(err => {
      console.error(err);
      statusEl.textContent = `${employeeName} 打卡失敗，請重試`;
      statusEl.className = "status error";
      restartBtn.hidden = false;
      isSubmitting = false; // 允許再次掃描
    });
}

// 啟動掃描器
function startScanner() {
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 220 },
    onScanSuccess
  ).catch(err => {
    console.error("掃描器啟動失敗:", err);
    statusEl.textContent = "掃描器啟動失敗";
    statusEl.className = "status error";
  });
}

// 停止掃描器
function stopScanner() {
  return html5QrCode.stop().catch(err => {
    console.warn("掃描器停止失敗:", err);
  });
}

// 初始啟動
statusEl.textContent = "等待掃描...";
statusEl.className = "status";
startScanner();

// 重新掃描按鈕
restartBtn.onclick = async () => {
  restartBtn.hidden = true;
  statusEl.textContent = "等待掃描...";
  statusEl.className = "status";
  isSubmitting = false;
  await stopScanner();
  startScanner();
};

// 下載打卡紀錄按鈕
downloadBtn.onclick = () => {
  window.open("http://localhost:3000/api/download", "_blank");
};
