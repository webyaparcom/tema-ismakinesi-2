/* surec-adimlar-3 — Dairesel Süreç Döngüsü (1 Kas 2026, T1-B varyant).
   Yer tutucular: sa3n sa3hub sa3steps. Veri: json.data[] = [{no?, baslik{}, metin{}}] (en çok 8 adım). Açılar render anında hesaplanır (--a).
   Ortak yardımcılar: esc t guvenliHref gorselYol evet sayi metinleriYaz (desing metinleri kaçışlı). */
var D = json.desing || {};
var L = json.lang || "tr";

/* HTML kaçışı — html'e giden her değer bundan geçer */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
/* Dil seçimi: aktif dil → tr → en → ilk anahtar (motorun wmPickLang'i) */
function t(v) { return wmPickLang(v, L); }
/* Bağlantı: dış/mailto/tel/# aynen; iç sayfa adı → dil önekli yol; javascript: vb. reddedilir */
function guvenliHref(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s) || s.charAt(0) === "/") { return s; }
  return wxLangInternalHref(s);
}
/* Görsel yolu: "/" ve http(s) aynen; yalın ad → /img/<ad>; tehlikeli şema → "" */
function gorselYol(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (s.charAt(0) === "/" || /^https?:\/\//i.test(s)) { return s; }
  return "/img/" + s;
}
function evet(v, d) {
  if (v === undefined || v === null || v === "") { return d; }
  return !(v === false || v === "false" || v === 0 || v === "0");
}
function sayi(v, d, mn, mx) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) { n = d; }
  return Math.min(mx, Math.max(mn, n));
}
/* desing'deki düz metin / {tr,en,ar} değerlerini {{anahtar}} yerine KAÇIŞLI yazar.
   Motor aynı yer tutucuyu ham yazardı; back.js önce davrandığı için kaçışsız değer html'e ulaşmaz. */
function metinleriYaz() {
  var k;
  for (k in D) {
    if (!Object.prototype.hasOwnProperty.call(D, k)) { continue; }
    var v = D[k];
    if (v == null) { continue; }
    var dilli = typeof v === "object" && !Array.isArray(v) && (typeof v.tr === "string" || typeof v.en === "string");
    if (typeof v === "object" && !dilli) { continue; }
    var deger = esc(t(v));
    var desen = new RegExp("\\{\\{" + String(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\}\\}", "g");
    html = html.replace(desen, function () { return deger; });
  }
}

var sa3Items = Array.isArray(json.data) ? json.data : [];
var sa3Adim = [];
var sa3i;
for (sa3i = 0; sa3i < sa3Items.length; sa3i++) {
  var it = sa3Items[sa3i] || {};
  var baslik = t(it.baslik);
  var metin = t(it.metin);
  if (!baslik && !metin) { continue; }
  sa3Adim.push({ no: it.no != null && String(it.no).trim() !== "" ? String(it.no) : String(sa3Adim.length + 1), baslik: baslik, metin: metin });
}
sa3Adim = sa3Adim.slice(0, 8);
var sa3N = Math.max(1, sa3Adim.length);

var sa3Steps = "";
for (sa3i = 0; sa3i < sa3Adim.length; sa3i++) {
  var a = sa3Adim[sa3i];
  /* açı: tepe noktasından saat yönünde eşit aralık (RTL'de CSS --yon ile ters) */
  var aci = Math.round((360 / sa3N) * sa3i * 100) / 100;
  sa3Steps += '<li class="modulex-sa3-step" style="--a:' + aci + 'deg">' +
    '<span class="modulex-sa3-no" aria-hidden="true">' + esc(a.no) + "</span>" +
    '<div class="modulex-sa3-metin">' +
    (a.baslik ? '<h3 class="modulex-sa3-h">' + esc(a.baslik) + "</h3>" : "") +
    (a.metin ? '<p class="modulex-sa3-p">' + esc(a.metin) + "</p>" : "") +
    "</div></li>";
}

var sa3Hub = '<div class="modulex-sa3-hub">' +
  (t(D.eyebrow) ? '<p class="modulex-sa3-eyebrow">' + esc(t(D.eyebrow)) + "</p>" : "") +
  (t(D.title) ? '<h2 class="modulex-sa3-title">' + esc(t(D.title)) + "</h2>" : "") +
  (t(D.description) ? '<p class="modulex-sa3-desc">' + esc(t(D.description)) + "</p>" : "") + "</div>";

html = html.replace(/\{\{sa3n\}\}/g, function () { return String(sa3N); });
html = html.replace(/\{\{sa3hub\}\}/g, function () { return sa3Hub; });
html = html.replace(/\{\{sa3steps\}\}/g, function () { return sa3Steps; });
metinleriYaz();
