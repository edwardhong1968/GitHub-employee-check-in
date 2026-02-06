let isSubmitting = false;

const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const downloadBtn = document.getElementById("downloadBtn");

// 打卡成功提示音
const beepSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

// 員工對照表 (可自行擴充)
const employeeMap = {
  "123456": "周",
  "234567": "洪",
  "345678": "徐",
  "456789": "蔡",
  "567890": "李",
  "洪永霖": "洪永霖",
  "徐德興": "徐德興"
};

// 後端伺服器 URL (手機要用電腦局域網 IP)
const SERVER_URL = "http://192.168.1.100:3000";

// 初始化掃描器
const html5QrCode = new Html5Qrcode("reader");

// 停止掃描器
async function stopScanner() {
  await html5QrCode.stop().catch(err => console.warn("掃描器停止失敗:", err));
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

// 掃描成功處理
function onScanSuccess(decodedText) {
  if (isSubmitting) return;
  isSubmitting = true;

  console.log("掃描結果:", decodedText);
  const employeeId = decodedText.trim();
  const employeeName = employeeMap[employeeId];

  if (!employeeName) {
    statusEl.textContent = `未知員工: ${decodedText}`;
    statusEl.className = "status error";
    restartBtn.hidden = false;
    isSubmitting = false;
    return;
  }

  statusEl.textContent = `打卡中... (${employeeName})`;
  statusEl.className = "status";

  // 前端直接顯示成功
  setTimeout(async () => {
    statusEl.textContent = `${employeeName} 打卡成功`;
    statusEl.className = "status success";
    beepSound.play();

    // 停止掃描器，避免重複掃描
    await stopScanner();

    // 同步傳送打卡資料到後端
    fetch(`${SERVER_URL}/api/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, name: employeeName })
    })
    .then(res => res.json())
    .then(data => console.log("後端回傳:", data))
    .catch(err => console.error("Fetch 錯誤:", err));

  }, 500); // 模擬網路延遲
}

// 初始啟動掃描器
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
