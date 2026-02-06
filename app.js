let isSubmitting = false;

const statusEl = document.getElementById("status");
const readerEl = document.getElementById("reader");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restart");
const downloadBtn = document.getElementById("downloadBtn");

const beepSound = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");

const employeeMap = {
  "123456": "周",
  "234567": "洪",
  "345678": "徐",
  "456789": "蔡",
  "567890": "李",
  "洪永霖": "洪永霖",
  "徐德興": "徐德興"
};

const SERVER_URL = "https://你的後端公開網址";

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
  ).then(() => console.log("掃描器啟動成功"))
  .catch(err => {
    console.error("掃描器啟動失敗:", err);
    statusEl.textContent = "請允許攝影機";
    statusEl.className = "status error";
    startBtn.hidden = false; // 顯示手動啟動按鈕
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

  setTimeout(async () => {
    statusEl.textContent = `${employeeName} 打卡成功`;
    statusEl.className = "status success";
    beepSound.play();
    await stopScanner();

    // 後端同步
    fetch(`${SERVER_URL}/api/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, name: employeeName })
    }).then(res => res.json())
      .then(data => console.log("後端回傳:", data))
      .catch(err => console.error("Fetch 錯誤:", err));
  }, 500);
}

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

// 檢測攝影機
Html5Qrcode.getCameras().then(cameras => {
  if (cameras && cameras.length) {
    // 手機有攝影機，自動啟動
    startScanner();
  } else {
    // 桌機或無攝影機
    statusEl.textContent = "桌機沒有攝影機，請用手機掃描";
    statusEl.className = "status error";
    startBtn.hidden = false; // 顯示手動啟動按鈕
    startBtn.onclick = () => {
      startBtn.hidden = true;
      startScanner();
    };
  }
}).catch(err => {
  console.error(err);
  statusEl.textContent = "無法檢測攝影機";
  statusEl.className = "status error";
  startBtn.hidden = false;
  startBtn.onclick = () => {
    startBtn.hidden = true;
    startScanner();
  };
});
