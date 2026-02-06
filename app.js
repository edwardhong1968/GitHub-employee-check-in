let isSubmitting = false;

const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const downloadBtn = document.getElementById("downloadBtn");

// 打卡成功提示音
const beepSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

// 員工對照表
const employeeMap = {
  "123456": "周",
  "234567": "洪",
  "345678": "徐",
  "456789": "蔡",
  "567890": "李",
  "洪永霖": "洪永霖",
  "徐德興": "徐德興"
};

// 公網後端 API（替換成你的公開網址）
const SERVER_URL = "https://你的後端公開網址";

// 初始化掃描器
const html5QrCode = new Html5Qrcode("reader");

// 停止掃描器
async function stopScanner() {
  await html5QrCode.stop().catch(err => console.warn("掃描器停止失敗:", err));
}

// 啟動掃描器
function startScanner() {
  statusEl.textContent = "等待掃描...";
  statusEl.className = "status";

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 220 },
    onScanSuccess
  )
  .then(() => console.log("掃描器啟動成功"))
  .catch(err => {
    console.error("掃描器啟動失敗:", err);
    statusEl.textContent = "掃描器啟動失敗，請允許攝影機";
    statusEl.className = "status error";
    alert("無法啟動掃描器，請確認攝影機權限或使用 HTTPS");
  });
}

// 掃描成功
function onScanSuccess(decodedText) {
  if (isSubmitting) return;
  isSubmitting = true;

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

  // 前端立即顯示成功
  setTimeout(async () => {
    statusEl.textContent = `${employeeName} 打卡成功`;
    statusEl.className = "status success";
    beepSound.play();

    // 停止掃描器
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

  }, 500);
}

// 初始啟動
startScanner();

// 重新掃描
restartBtn.onclick = async () => {
  restartBtn.hidden = true;
  isSubmitting = false;
  await stopScanner();
  startScanner();
};

// 下載打卡紀錄
downloadBtn.onclick = () => {
  window.open(`${SERVER_URL}/api/download`, "_blank");
};
