import JSZip from 'jszip';
import { exportBackupJSON } from './storage';

/**
 * Downloads a text/blob file directly to the user device
 */
export function triggerFileDownload(filename: string, content: string | Blob, mimeType = 'text/plain') {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generates an offline standalone HTML package of Jannat Al-Rahman app
 */
export function generateStandaloneHTML(backupDataJson?: string): string {
  const backup = backupDataJson || exportBackupJSON();
  const dateStr = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تطبيق جنّة الرحمن - نسخة التصدير والتصفح الذاتي</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0F6B50;
      --primary-dark: #094735;
      --gold: #C19E2B;
      --bg: #FAF7F0;
      --card-bg: #FFFFFF;
      --text: #19302A;
      --border: #E5DDCF;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 16px;
      direction: rtl;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .container {
      max-width: 640px;
      width: 100%;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #0B5C46, #168064, #276D5A);
      color: white;
      padding: 24px 20px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(15, 107, 80, 0.3);
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .header p {
      font-size: 13px;
      opacity: 0.9;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .card h2 {
      font-size: 16px;
      color: var(--primary);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .quran-quote {
      font-family: 'Amiri Quran', 'Amiri', serif;
      font-size: 20px;
      text-align: center;
      line-height: 2.2;
      color: #0F6B50;
      padding: 16px;
      background: #F4EFE6;
      border-radius: 16px;
      border: 1px dashed var(--gold);
      margin-bottom: 14px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--primary);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }
    .btn-gold {
      background: linear-gradient(135deg, #C19E2B, #D8B43F);
      color: #fff;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }
    .stat-box {
      background: #FAF7F0;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px;
      text-align: center;
    }
    .stat-num {
      font-size: 20px;
      font-weight: 800;
      color: var(--primary);
    }
    .stat-label {
      font-size: 11px;
      color: #666;
    }
    .code-box {
      background: #111A16;
      color: #2DD4BF;
      padding: 12px;
      border-radius: 12px;
      font-family: monospace;
      font-size: 11px;
      direction: ltr;
      text-align: left;
      overflow-x: auto;
      margin-top: 8px;
      max-height: 140px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      margin-top: 20px;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 تطبيق جنّة الرحمن</h1>
      <p>نسخة التصدير المستقلة والموثقة (${dateStr})</p>
    </div>

    <div class="card">
      <div class="quran-quote">
        ﷽<br>
        ﴿ إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا كَبِيرًا ﴾
      </div>
      <p style="font-size: 13px; color: #555; text-align: center;">
        هذه الصفحة تم تصديرها من تطبيق جنّة الرحمن للقرآن الكريم والأذكار والمتابعة الإيمانية.
      </p>
    </div>

    <div class="card">
      <h2>📊 ملخص بياناتك الإيمانية</h2>
      <div class="grid-2" id="statsGrid">
        <div class="stat-box">
          <div class="stat-num" id="statPage">-</div>
          <div class="stat-label">آخر صفحة تم فتحها</div>
        </div>
        <div class="stat-box">
          <div class="stat-num" id="statTree">-</div>
          <div class="stat-label">نسبة نمو شجرة العبادات</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>💾 كود النسخة الاحتياطية المرفق</h2>
      <p style="font-size: 12px; color: #666;">
        بياناتك المشفرة بصيغة JSON محفوظة داخل هذا الملف، يمكنك نسخها واستيرادها في التطبيق بأي وقت:
      </p>
      <pre class="code-box" id="backupPre">${backup}</pre>
      <button class="btn" style="margin-top: 12px;" onclick="copyBackup()">📋 نسخ كود النسخة الاحتياطية</button>
    </div>

    <div class="card">
      <h2>🌐 فتح التطبيق مباشرة على الويب</h2>
      <p style="font-size: 13px; color: #555; margin-bottom: 12px;">
        يمكنك الوصول إلى التطبيق الكامل والتصفح الشامل للمصحف والأذكار والشجرة التفاعلية عبر الرابط:
      </p>
      <a href="https://ais-pre-mkvwcipusuils24u7e62uk-370477156971.europe-west2.run.app" target="_blank" class="btn btn-gold">
        🌟 فتح تطبيق جنّة الرحمن أونلاين
      </a>
    </div>

    <div class="footer">
      تطبيق جنّة الرحمن • صدقة جارية • تم التصدير بنجاح
    </div>
  </div>

  <script>
    try {
      const data = JSON.parse(document.getElementById('backupPre').textContent);
      if (data) {
        if (data.lastReadPage) {
          document.getElementById('statPage').textContent = 'صفحة ' + data.lastReadPage;
        }
        if (data.dayTracker && data.dayTracker.treeGrowthPercentage !== undefined) {
          document.getElementById('statTree').textContent = data.dayTracker.treeGrowthPercentage + '%';
        }
      }
    } catch(e) {}

    function copyBackup() {
      const text = document.getElementById('backupPre').textContent;
      navigator.clipboard.writeText(text).then(() => {
        alert('✅ تم نسخ كود النسخة الاحتياطية بنجاح إلى الحافظة!');
      }).catch(() => {
        alert('يرجى تحديد الكود ونسخه يدوياً.');
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Creates and triggers download for a comprehensive .ZIP archive containing:
 * 1. standalone-page.html (complete offline HTML page)
 * 2. backup-data.json (full database & settings JSON)
 * 3. AndroidManifest.xml (ready for APK builders with Audio Permissions)
 * 4. MainActivity-Audio-Permission.java (Java sample code for WebView mic)
 * 5. index.html (web entry code)
 * 6. README-INSTRUCTIONS.txt (Arabic guide for APK & backup restore)
 */
export async function generateAndDownloadZipArchive(): Promise<void> {
  const zip = new JSZip();
  const dateStr = new Date().toISOString().slice(0, 10);
  const backupJson = exportBackupJSON();
  const standaloneHtml = generateStandaloneHTML(backupJson);

  // 1. Standalone HTML file
  zip.file('jannat-alrahman-page.html', standaloneHtml);

  // 2. Pure JSON backup
  zip.file(`backup-data-${dateStr}.json`, backupJson);

  // 3. AndroidManifest.xml with microphone permissions
  const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.jannat.alrahman">

    <!-- 🎙️ أذونات الميكروفون وسماعات الرأس لتسجيل التلاوة -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- 🌐 أذونات الإنترنت لجلب التلاوات الصوتية والتفاسير -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:label="جنة الرحمن"
        android:icon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`;
  zip.file('android/AndroidManifest.xml', manifestContent);

  // 4. Java WebView Helper for Mic Permissions
  const javaHelperContent = `package com.jannat.alrahman;

import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // 🎙️ منح الإذن لصفحة الويب للوصول للميكروفون وسماعات الرأس
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });

        // رابط التطبيق أو الصفحة المحلية
        webView.loadUrl("file:///android_asset/jannat-alrahman-page.html");
    }
}`;
  zip.file('android/MainActivity.java', javaHelperContent);

  // 5. JavaScript Voice Search & Mic Code Snippets (HTML + JS)
  const voiceSearchSnippet = `<!-- ===== كود البحث الصوتي باللغة العربية والتعرف على الصوت (SpeechRecognition) ===== -->
<div style="display: flex; gap: 8px; max-width: 400px; margin: 20px auto; font-family: sans-serif;" dir="rtl">
    <input id="searchInput" type="text" placeholder="اكتب أو انطق كلمة للبحث..." style="flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #ccc; font-size: 14px;">
    <button id="micBtn" type="button" style="padding: 12px 16px; background: #0F6B50; color: #fff; border-radius: 10px; border:none; font-weight: bold; cursor: pointer;">
        🎤
    </button>
</div>

<div id="micStatus" style="text-align: center; font-size: 13px; color: #666; font-family: sans-serif;"></div>

<script>
const micBtn = document.getElementById('micBtn');
const searchInput = document.getElementById('searchInput');
const micStatus = document.getElementById('micStatus');

// التحقق من دعم المتصفح للتعرف على الصوت
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'ar-SA'; // ضبط اللغة للعربية
  recognition.continuous = false;

  micBtn.addEventListener('click', async () => {
    try {
      // طلب إذن الميكروفون من المستخدم
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // بدء الاستماع
      recognition.start();
      micBtn.style.backgroundColor = '#ff4d4d'; // تغيير لون الزر للتنبيه بالاستماع
      if (micStatus) micStatus.textContent = '🎙️ جارٍ الاستماع لصوتك الآن...';
    } catch (err) {
      alert("يرجى السماح بصلاحية الميكروفون من إعدادات الهاتف لاستخدام البحث الصوتي.");
    }
  });

  // عند التقاط الصوت وتحويله لنص
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    if (micStatus) micStatus.textContent = 'تم التقاط: ' + transcript;
    
    // تشغيل دالة البحث عندك تلقائياً
    if (typeof searchFunction === "function") {
      searchFunction(transcript);
    }
  };

  recognition.onend = () => {
    micBtn.style.backgroundColor = ''; // إعادة لون الزر الطبيعي
  };

  recognition.onerror = (event) => {
    console.error("خطأ في الميكروفون:", event.error);
    micBtn.style.backgroundColor = '';
    if (micStatus) micStatus.textContent = 'حدث خطأ في التقاط الصوت: ' + event.error;
  };
} else {
  micBtn.style.display = 'none'; // إخفاء الزر لو المتصفح لا يدعم الميزة
  console.log("التعرف على الصوت غير مدعوم في هذا المتصفح");
}
<\/script>`;
  zip.file('snippets/voice-search-speech-recognition.html', voiceSearchSnippet);

  // 6. Arabic Readme Guide
  const readmeContent = `=====================================================
🌿 حزمة تطبيق جنّة الرحمن الكاملة (تصدير وملف مضغوط)
=====================================================
تاريخ الإنشاء: ${dateStr}

محتويات هذا الملف المضغوط (ZIP):
-----------------------------------------------------
1. jannat-alrahman-page.html:
   صفحة HTML مستقلة كاملة تعمل بدون إنترنت وبدون تثبيت على أي متصفح أو هاتف، وتتضمن ملخص بياناتك والنسخة الاحتياطية.

2. backup-data-${dateStr}.json:
   ملف النسخة الاحتياطية لبياناتك (إعدادات، شجرة العبادات، الفواصل المرجعية، الختمات).

3. android/AndroidManifest.xml:
   ملف الأذونات الجاهز للبناء في أندرويد (يتضمن إذن RECORD_AUDIO والإنترنت).

4. android/MainActivity.java:
   كود تفعيل الـ WebView في أندرويد للسماح بالتقاط الصوت وتمرير إذن الميكروفون.

5. snippets/microphone-system.html:
   كود الميكروفون التفاعلي الجاهز للإدراج في أي صفحة ويب.

-----------------------------------------------------
جزاكم الله خيراً وبارك في أعمالكم الصالحة.
`;
  zip.file('README-INSTRUCTIONS.txt', readmeContent);

  // Generate blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerFileDownload(`jannat-alrahman-package-${dateStr}.zip`, blob, 'application/zip');
}
