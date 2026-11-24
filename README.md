# 資訊科太陽能教學島

以太陽能、行動電源與 USB 風扇量測為主題的 3D 學習網站。

- [GitHub Pages 教學網站](https://t6301.github.io/solar-learning-island/)
- [Sites 教學網站與共用資料服務](https://learning-islands-master-1124.nearbycress1.chatgpt.site/)

## 教學功能

四座島依序為太陽發電、儲能解密、風扇量測及能源驗證。學生由下拉選單選擇組別與座號姓名登入；名單共 22 位、6 組。這是無密碼的課堂名單登入，並非學校帳號驗證。

學生填妥每關必填內容後，系統自動勾選任務並解鎖下一關。文字題至少 10 個中文字或英數字；量測關須完成第 0～10 分鐘共 11 筆數值及第 5、10 分鐘觀察。系統檢查完整性，內容正確性由教師評閱。

島嶼的完成旗幟由線上資料庫共用，同一位學生每座島只計數一次。完成人數增加時，島嶼同步放大。個人作答留在各瀏覽器，並依學生分開儲存；完成名單可跨裝置觀看。

## GitHub Pages 與資料服務

GitHub Pages 提供 `public/` 的靜態網頁；GitHub Actions 於每次推送 `main` 時自動檢查、建置及發布。登入、完成名單與人數資料由 Sites 的 Cloudflare Worker 與 D1 資料庫提供。請保留該 Sites 服務在線，才可使用全班同步功能。

`scripts/build-pages.mjs` 會產生 `_site/` 並設定公開的 API 網址。網站資源採相對路徑，支援 GitHub Pages 的專案子目錄。Worker 僅允許原 Sites 來源與 `https://t6301.github.io` 呼叫跨來源 API。移到其他帳號時，須一併調整來源設定並重新部署 Worker。

儲存庫包含網頁、伺服器與資料庫結構，未包含即時資料庫內容、學生作答、登入權杖或 API 金鑰。`public/roster.json` 為本課堂的公開登入名單。

## 本機檢查

使用 Node.js 24，無需安裝 npm 套件。

```powershell
node scripts/build.mjs
node scripts/test.mjs
node scripts/test-backend.mjs
node scripts/preview.mjs
```

本機預覽為 `http://127.0.0.1:8766/`，資料庫在記憶體中，停止後會清空，不會修改線上的學生完成名單。

```powershell
node scripts/build-pages.mjs
```

## 檔案

- `public/`：網站畫面、3D 場景、名單與填寫解鎖規則。
- `worker/backend.mjs`：登入、完成紀錄與名單 API。
- `drizzle/`：資料庫遷移。
- `scripts/`：建置、檢查與本機預覽。
- `.github/workflows/pages.yml`：GitHub Pages 自動發布。
- `.openai/hosting.json`：既有 Sites 的識別與 D1 綁定，更新時須保留。

教學內容依教師提供的行動電源耗電量測教案改編，太陽能島為延伸活動；保留 AI 紅、黃、綠燈及先手算再核對的原則。
