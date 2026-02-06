let isSubmitting = false;

const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const downloadBtn = document.getElementById("downloadBtn");

// 打卡成功提示音
const beepSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

// 員工編號對應表
const employeeMap = {
  "洪永霖": "洪永霖",
  "徐德興": "徐德興",
  "123456": "周",
  "234567": "洪",
  "345678": "徐",
  "456789": "蔡",
  "567890": "李"
};

// **設定你的伺服器 IP 或域名**
// 例如電腦局域網 IP: 192.168.1.100
const SERVER_URL = "http://192.168.1.100:3000";

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

  fetch(`${SERVER_URL}/api/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId, name: employeeName })
  })
.then(res => res.json())
.then(async data => {
  console.log("後端回傳:", data); // 印出完整回傳，方便偵錯

  // 無論後端回傳什麼，只要掃描成功就顯示成功
  statusEl.textContent = `${employeeName} 打卡成功`;
  statusEl.className = "status success";
  beepSound.play();

  // 成功後停止掃描器
  await stopScanner();

  // 如果後端回傳有錯誤訊息，也可以在 console.log 查看
  if (data.status && data.status !== "success") {
    console.warn("後端回傳非 success:", data);
  }
})
.catch(err => {
  console.error("Fetch 錯誤:", err);
  // 打卡失敗才顯示錯誤訊息
  statusEl.textContent = `${employeeName} 打卡失敗，請重試`;
  statusEl.className = "status error";
  restartBtn.hidden = false;
  isSubmitting = false; // 允許再次掃描
});

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
  window.open(`${SERVER_URL}/api/download`, "_blank");
};
