# Dars nazorati

`Dars nazorati` o'quv markazida ruxsat bilan ishlatiladigan ekran kuzatuv
ilovasi. Student Agent ochilganda ekranda doim ko'rinadigan kichik oyna chiqadi.
U faqat asosiy monitor screenshotini yuboradi. Klaviatura, sichqoncha, fayllar,
kamera, mikrofon, parollar va cookie ma'lumotlariga tegmaydi.

## Fayllar

- `student_agent.py` - o'quvchi kompyuterida ishlaydigan ko'rinadigan agent.
- `teacher_server.py` - screenshot qabul qiladigan Flask server.
- `templates/dashboard.html` - ustoz dashboardi.
- `.env.example` - sozlamalar namunasi.

## Python va kutubxonalarni o'rnatish

1. Windows uchun Python 3.11 yoki yangi versiyani
   [python.org](https://www.python.org/downloads/windows/) saytidan o'rnating.
   O'rnatishda `Add Python to PATH` belgisini yoqing.
2. Loyiha papkasida PowerShell oching.
3. Virtual muhit yarating va kutubxonalarni o'rnating:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## `.env` sozlash

`.env.example` faylidan `.env` nusxa yarating. Bir kompyuterda server va agentni
sinash mumkin. Alohida kompyuterlarda har biriga kerakli qatorlarni o'z `.env`
fayliga joylashtiring.

Teacher Server uchun:

```dotenv
API_TOKEN=uzun_va_tasodifiy_token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=mustahkam_dashboard_paroli
OFFLINE_SECONDS=10
HOST=0.0.0.0
PORT=5000
```

Student Agent uchun:

```dotenv
SERVER_URL=https://server-manzili.example/upload
API_TOKEN=uzun_va_tasodifiy_token
STUDENT_NAME=HP-1
CAPTURE_INTERVAL=1
MAX_WIDTH=1280
JPEG_QUALITY=60
```

Har bir o'quvchi kompyuterida `STUDENT_NAME` noyob bo'lishi kerak: `HP-1`,
`HP-2` va hokazo. Agent rasmni 1280 piksel en va 720 piksel balandlikdan
oshirmaydi. `API_TOKEN` server va barcha ruxsatli agentlarda aynan bir xil
bo'lishi kerak.

## Teacher Serverni ishga tushirish

```powershell
.\.venv\Scripts\Activate.ps1
python teacher_server.py
```

Dashboardni `http://localhost:5000/` manzilida oching. Brauzer `.env` dagi
`ADMIN_USERNAME` va `ADMIN_PASSWORD` ni so'raydi.

## Student Agentni ishga tushirish

Oddiy sinov uchun:

```powershell
.\.venv\Scripts\Activate.ps1
python student_agent.py
```

Windowsda CMD oynasisiz ishga tushirish uchun virtual muhitdagi `pythonw.exe`
dan foydalaning:

```powershell
.\.venv\Scripts\pythonw.exe student_agent.py
```

Agent oynasi ko'rinib turadi va unda `Dars nazorati ishlayapti`, ulanish holati
hamda `Stop` tugmasi bor. `Stop` uzatishni to'xtatadi va agentni yopadi.

## Windows startup'ga qo'shish

Agent yashirin service sifatida o'rnatilmaydi. Windows login qilinganda
ko'rinadigan oynasi bilan ochilishi uchun:

1. `Win + R` bosing, `shell:startup` yozing va Enter bosing.
2. Ochilgan Startup papkasida yangi shortcut yarating.
3. Shortcut target qatoriga to'liq yo'llarni kiriting:

```text
"C:\dars\.venv\Scripts\pythonw.exe" "C:\dars\student_agent.py"
```

4. `Start in` qatoriga loyiha papkasini kiriting, masalan `C:\dars`.
5. Har bir o'quvchi kompyuteridagi `.env` faylida o'z `STUDENT_NAME` qiymatini
   tekshiring.

## Lokal Wi-Fi tarmog'ida ishlatish

1. Teacher Server ishlaydigan kompyuterning lokal IP manzilini `ipconfig`
   orqali toping, masalan `192.168.1.10`.
2. Windows Firewall'da tanlangan portga, masalan `5000`, faqat lokal tarmoqdan
   kirishga ruxsat bering.
3. Dastlab lokal sinovda student `.env` faylida quyidagini ishlatish mumkin:

```dotenv
SERVER_URL=http://192.168.1.10:5000/upload
```

Amaliy foydalanishda lokal tarmoqda ham HTTPS tavsiya qilinadi.

## Internet server va HTTPS

Internet orqali ishlatganda Flask development serverini bevosita internetga
ochmang. Domenli serverda Flask ilovasini production WSGI server bilan
ishlating va oldiga Nginx yoki Caddy reverse proxy qo'ying. HTTPS sertifikatini
Let's Encrypt orqali sozlang. Shundan keyin agentlarda:

```dotenv
SERVER_URL=https://dars.example.com/upload
```

HTTPS screenshot va tokenni tarmoqda shifrlaydi. `API_TOKEN` hamda dashboard
parolini uzun va tasodifiy tanlang, ularni repozitoriyga joylamang. Internet
serverida firewall orqali faqat HTTPS portini oching.

## Ruxsat va maxfiylik qoidalari

- O'quvchi va ota-ona yoki qonuniy vakilga kuzatuv haqida oldindan tushuntiring.
- Mahalliy qonun va o'quv markaz siyosatiga mos yozma ruxsat oling.
- Agent oynasini yashirmang va uni yashirin service sifatida o'rnatmang.
- Screenshotlarga faqat vakolatli ustozlar dashboard login orqali kirsin.
- Kerak bo'lmagan screenshotlarni saqlamang. Ushbu dastur faqat har bir student
  uchun eng oxirgi screenshotni server xotirasida saqlaydi; server qayta
  ishga tushsa ular o'chadi.
- `API_TOKEN`, admin login va admin parolini `.env` faylida saqlang.

## Xatoliklarni ko'rish

Teacher Server loglarni terminalga chiqaradi. Student Agent loglarni
`student_agent.log` fayliga yozadi. Agentni `python` bilan ishga tushirsangiz
ular terminalda ham ko'rinadi. Logda screenshotning o'zi saqlanmaydi.
