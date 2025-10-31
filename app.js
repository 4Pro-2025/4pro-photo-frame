// HTMLの部品を取得
const video = document.getElementById('camera-feed');
//const frame = document.getElementById('frame');
const frameDisplay = document.getElementById('frame-display');
const shutterBtn = document.getElementById('shutter-btn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resultModal = document.getElementById('result-modal');
const resultImage = document.getElementById('result-image');
const closeBtn = document.getElementById('close-btn');

const switchCamBtn = document.getElementById('switch-cam-btn');
let currentFacingMode = 'environment';
let currentStream = null;


// 1. 使用するフレームのパスをすべて配列に入れる
const framePaths = [
    'frame.png',
    'frame2.png',
    'frame3.png'
    // (3つめがあれば 'frame3.png' も追加)
];

// 2. 画像を事前に読み込むための配列
const frameImages = [];
framePaths.forEach(path => {
    const img = new Image(); // 新しいImageオブジェクトを作成
    img.src = path;          // パスを設定（この時点で読み込みが開始される）
    frameImages.push(img); // 配列に格納
});

// 3. 現在選択されているフレームの番号
let currentFrameIndex = 0; // 初期値は0 (frame1.png)

// 4. フレーム選択ボタン（.frame-btn）を取得
const frameButtons = document.querySelectorAll('.frame-btn');

// 5. 各ボタンにクリックイベントを設定
frameButtons.forEach(button => {
    button.addEventListener('click', () => {
        // ボタンの data-index 属性（HTMLで設定した 0 や 1）を取得
        const index = parseInt(button.dataset.index, 10);
        
        // 選択中の番号を更新
        currentFrameIndex = index;
        
        // 画面に表示されているフレーム画像（frame-display）を切り替える
        frameDisplay.src = framePaths[currentFrameIndex];
    });
});

// フレーム切り替え処理ここまで

// --- 1. カメラを起動する ---
async function startCamera() {
    // 1. もし既にカメラが起動中なら、それを停止する
    if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop();
        });
    }

    // 2. 新しい facingMode でカメラを起動する
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: currentFacingMode, 
                aspectRatio: 4/3,
                
                // 理想の解像度を指定 (UXGA 1600x1200)
                // スマホがこの解像度に対応していれば、これが使われる
                width: { ideal: 1600 },
                height: { ideal: 1200 }
            }
        });
        
        video.srcObject = stream;
        video.play();
        
        currentStream = stream;

    } catch (err) {
        console.error("カメラの起動に失敗しました:", err);
        // もし高解像度すぎてエラーが出たら、アラートを追加しても良い
        // alert("高解像度カメラの起動に失敗しました。");
    }
}

// --- 2. シャッターボタンが押された時の処理 ---
shutterBtn.addEventListener('click', () => {
    
    // canvasに映像とフレームを描画
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(frameImages[currentFrameIndex], 0, 0, canvas.width, canvas.height);

    // --- 2-4. 合成した画像をポップアップで表示 ---
    const imageDataUrl = canvas.toDataURL('image/png');
    
    // ★★★ 修正点①：これが抜けていました ★★★
    // ポップアップ内の画像に、今撮った画像を設定
    resultImage.src = imageDataUrl;
    
    // ポップアップを表示 (display: none を flex に変更)
    resultModal.style.display = 'flex'; 
    // ★★★★★★★★★★★★★★★★★★★★★★

    // (ここにあった closeBtn の処理は削除)
});


// ★★★ 修正点②：「とじる」ボタンの処理は、シャッターボタンの外に書きます ★★★
// --- 3. ポップアップを閉じる処理 ---
closeBtn.addEventListener('click', () => {
    resultModal.style.display = 'none'; // ポップアップを非表示に
    resultImage.src = ""; // メモリ解放のために画像を空にする
});

switchCamBtn.addEventListener('click', () => {
    // facingMode を切り替える
    if (currentFacingMode === 'environment') {
        currentFacingMode = 'user'; // 'user' = 内側カメラ
    } else {
        currentFacingMode = 'environment'; // 'environment' = 外側カメラ
    }
    
    // 新しい設定でカメラを再起動
    startCamera();
});


// ページが読み込まれたらカメラを起動
startCamera();