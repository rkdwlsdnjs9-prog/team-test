// 1. 팀장이 발급받은 Supabase 정보 입력 (리허설용이니 여기에 직접 붙여넣으셔도 됩니다)
// 로컬 .env 파일이 존재하고 로컬 웹 서버로 실행 시, 자동으로 .env의 키를 읽어옵니다.
let SUPABASE_URL = "https://uvmxhqxuszkqjrjnwnli.supabase.co";
let SUPABASE_KEY = "sb_publishable_Q1AjTtSurQJh0n61BfadNw_lZS-E7s7";

let supabaseClient;

// 로컬 .env 파일을 불러와서 값을 설정하는 함수
async function initializeSupabase() {
    try {
        const response = await fetch('.env');
        if (response.ok) {
            const text = await response.text();
            const env = {};
            text.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.substring(0, eqIdx).trim();
                    const value = trimmed.substring(eqIdx + 1).trim().replace(/(^['"]|['"]$)/g, '');
                    env[key] = value;
                }
            });

            if (env.SUPABASE_URL && !env.SUPABASE_URL.includes("본인의_")) {
                SUPABASE_URL = env.SUPABASE_URL;
            }
            if (env.SUPABASE_KEY && !env.SUPABASE_KEY.includes("본인의_")) {
                SUPABASE_KEY = env.SUPABASE_KEY;
            }
        }
    } catch (e) {
        console.log("로컬 .env 파일을 읽지 못했습니다. (로컬 웹서버가 아니거나 파일이 없을 수 있습니다. script.js 내 설정으로 진행합니다)");
    }

    // Supabase 초기화 (전역 window.supabase 객체를 명시하여 선언 충돌 에러 방지)
    try {
        if (!window.supabase) {
            throw new Error("Supabase 라이브러리가 로드되지 않았습니다. 인터넷 연결이나 CDN 주소를 확인하세요.");
        }
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (err) {
        console.error("Supabase 초기화 오류:", err);
    }
}

// 페이지가 로드되면 설정 진행
initializeSupabase();

// 버튼 클릭 이벤트
document.getElementById("btnSubmit").addEventListener("click", async () => {
    const nameInput = document.getElementById("teamMemberName").value;
    const statusText = document.getElementById("status");

    if (!nameInput) {
        alert("이름을 입력해주세요!");
        return;
    }

    // 1. 초기 연결 체크
    if (!supabaseClient || SUPABASE_URL.includes("본인의_") || SUPABASE_KEY.includes("본인의_")) {
        statusText.className = "";
        statusText.style.color = "#ef4444";
        statusText.innerText = "⚠️ Supabase 주소와 Anon Key를 설정해주세요! (.env 또는 script.js)";
        return;
    }

    statusText.innerText = "데이터 전송 중...";
    statusText.className = "status-loading";
    statusText.style.color = "#d946ef";

    // Supabase의 test_table에 이름과 시간 저장 시도
    const { data, error } = await supabaseClient
        .from('test_table')
        .insert([{ member_name: nameInput, created_at: new Date() }]);

    statusText.className = ""; // 로딩 클래스 해제

    if (error) {
        console.error(error);
        statusText.style.color = "#ef4444";
        statusText.innerText = "❌ 전송 실패! (콘솔 F12 에러를 확인하세요)";
    } else {
        statusText.style.color = "#10b981";
        statusText.innerText = `🎉 [${nameInput}]님 전송 성공! Supabase 대시보드를 확인하세요.`;
    }
});
