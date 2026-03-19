<div id="frontEmlBg" onclick="if(event.target===this)closeFrontEml()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9000;align-items:center;justify-content:center">
  <div style="background:#fff;border-radius:16px;padding:28px;width:380px;max-width:92vw;box-shadow:0 16px 48px rgba(0,0,0,.18)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <b style="font-size:1rem;color:#04142b">📧 내역 이메일로 받기</b>
      <button onclick="closeFrontEml()" style="border:none;background:none;font-size:1.2rem;cursor:pointer;color:#94a3b8;line-height:1">✕</button>
    </div>
    <div id="frontEmlBody">
      <div id="frontEmlSummary" style="background:#eaf4ff;border-radius:10px;padding:12px 14px;font-size:.8rem;color:#475569;line-height:1.7;margin-bottom:14px"></div>
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px">
        <label style="font-size:.73rem;font-weight:700;color:#475569">이메일 주소 <em style="color:#ef4444">*</em></label>
        <input id="frontEmlAddr" type="email" placeholder="your@email.com" style="border:1.5px solid #e2e8f0;border-radius:9px;padding:10px 13px;font-size:.87rem;font-family:inherit;color:#1e293b;outline:none;transition:border-color .18s" onfocus="this.style.borderColor='#1e7fe8'" onblur="this.style.borderColor='#e2e8f0'">
      </div>
      <button onclick="sendFrontEml()" style="width:100%;padding:11px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(90deg,#1255a6,#1e7fe8);color:#fff;font-family:inherit;font-weight:700;font-size:.87rem">이메일 전송</button>
    </div>
    <div id="frontEmlDone" style="display:none;text-align:center;padding:12px 0">
      <div style="font-size:2.2rem;margin-bottom:8px">✅</div>
      <div style="font-weight:700;color:#059669;font-size:.95rem">내역이 접수되었습니다</div>
      <div style="font-size:.75rem;color:#94a3b8;margin-top:4px" id="frontEmlDoneAddr"></div>
      <button onclick="closeFrontEml()" style="margin-top:14px;padding:8px 22px;border-radius:9px;border:1.5px solid #e2e8f0;background:#fff;color:#475569;font-family:inherit;font-weight:700;font-size:.8rem;cursor:pointer">닫기</button>
    </div>
  </div>
</div>