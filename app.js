let isSubmitting = false;
let records = JSON.parse(localStorage.getItem("checkinRecords") || "[]");

const statusEl = document.getElementById("status");
const readerWrapper = document.getElementById("reader-wrapper"); // 用 wrapper 包住 reader
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

let html5QrCode; 

/** 初始化掃描器 DOM */
function createReaderDiv() {
  const oldDiv = document.getElementById("reader");
  if (oldDiv) oldDiv.remove(); 
  const newDiv = document.createElement("div");
  newDiv.id = "reader";
  readerWrapper.appendChild(newDiv);
}

/** 啟動掃描器 */
function startScanner() {
  isSubmitting = false;
  statusEl.textContent = "等待掃描...";
  statusEl.className = "status";
  restartBtn.style.display = "none";

  createReaderDiv(); // 先建立新的 reader

  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 220 },
    onScanSuccess
  ).then(() => console.log("掃描器啟動成功"))
    .catch(err => {
      console.error("掃描器啟動失敗:", err);
      statusEl.textContent = "請允許攝影機";
      statusEl.className = "status error";
      startBtn.style.display = "inline-block";
    });
}

/** 停止掃描器 */
async function stopScanner() {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
      console.log("掃描器已停止");
    } catch (err) {
      console.warn("停止掃描器失敗:", err);
    }
  }
}

/** 打卡流程 */
async function handleCheckin(employeeId, employeeName) {
  isSubmitting = true;
  const timestamp = new Date().toLocaleString();
  statusEl.textContent = `打卡中... (${employeeName})`;
  statusEl.className = "status";

  try {
    await stopScanner();
    beepSound.play();
    statusEl.textContent = `${employeeName} 打卡成功 - ${timestamp}`;
    statusEl.className = "status success";

    records.push({ employeeId, employeeName, timestamp });
    localStorage.setItem("checkinRecords", JSON.stringify(records));

    restartBtn.style.display = "inline-block";

    fetch(`${SERVER_URL}/api/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, name: employeeName, time: timestamp })
    }).then(res => res.json())
      .then(data => console.log("後端回傳:", data))
      .catch(err => console.error("Fetch 錯誤:", err));

  } catch (err) {
    console.error(err);
    statusEl.textContent = "打卡失敗，請重新掃描";
    statusEl.className = "status error";
    restartBtn.style.display = "inline-block";
  } finally {
    isSubmitting = false;
  }
}

/** QR Code 成功回調 */
function onScanSuccess(decodedText) {
  if (isSubmitting) return;

  const employeeId = decodedText.trim();
  const employeeName = employeeMap[employeeId];
  if (!employeeName) {
    statusEl.textContent = `未知員工: ${decodedText}`;
    statusEl.className = "status error";
    restartBtn.style.display = "inline-block";
    return;
  }

  handleCheckin(employeeId, employeeName);
}

/** 重新掃描按鈕 */
restartBtn.onclick = () => {
  restartBtn.style.display = "none";
  startScanner();
};

/** 下載 CSV */
downloadBtn.onclick = () => {
  if (records.length === 0) return alert("目前沒有打卡紀錄可下載！");
  let csvContent = "員工ID,姓名,打卡時間\n";
  records.forEach(r => csvContent += `${r.employeeId},${r.employeeName},${r.timestamp}\n`);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "打卡紀錄.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/** 檢測攝影機 */
Html5Qrcode.getCameras().then(cameras => {
  if (cameras && cameras.length) startScanner();
  else {
    statusEl.textContent = "桌機沒有攝影機，請用手機掃描";
    statusEl.className = "status error";
    startBtn.style.display = "inline-block";
    startBtn.onclick = () => { startBtn.style.display = "none"; startScanner(); };
  }
}).catch(err => {
  console.error(err);
  statusEl.textContent = "無法檢測攝影機";
  statusEl.className = "status error";
  startBtn.style.display = "inline-block";
  startBtn.onclick = () => { startBtn.style.display = "none"; startScanner(); };
});
