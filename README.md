# 해커스 송년회 공용 인터넷 리액션 시스템

## 무엇이 달라졌나요?
- 관객 휴대폰은 행사장 Wi-Fi가 아니라 LTE/5G로 접속 가능
- QR 1개로 참여
- ❤️ / 👍 / 😎 세 버튼만 제공
- 누르는 즉시 행사 화면용 `/display`에 반영
- WebSocket 기반 실시간 전송
- 간단한 IP 기준 클릭 속도 제한
- 관리자 카운트 초기화 기능

## 실제 행사 사용
이 폴더는 "공용 인터넷에 배포할 수 있는 완성형 코드"입니다.
다만 인터넷 공개 URL을 만들려면 Render/Railway/VPS 같은 호스팅 계정에 한 번 배포해야 합니다.

### Render 기준
1. GitHub에 이 폴더를 새 저장소로 올립니다.
2. Render에서 New > Web Service로 저장소를 연결합니다.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. 환경변수:
   - `ADMIN_KEY`: 행사 운영자용 비밀번호
   - `PUBLIC_URL`: Render에서 발급된 https 주소 (예: https://hackers-reaction-wall.onrender.com)
6. 배포 후 `/admin` 접속
7. QR을 행사 PPT/LED에 띄우거나 인쇄
8. `/display`를 OBS/vMix의 Browser Source로 넣으면 투명 배경 위에 리액션을 올릴 수 있습니다.

## 중요
- 실제 800명 행사는 행사 전에 반드시 동일 장비/네트워크로 리허설하세요.
- 관리자 키는 공개하지 마세요.
- 무료 호스팅은 절전/콜드스타트 정책이 있을 수 있으므로 행사 당일에는 유료/상시 실행 플랜을 권장합니다.
- 현재 카운트는 서버 메모리에 저장되므로 서버 재시작 시 0으로 초기화됩니다.
