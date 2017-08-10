## 기여하기

### 1. 시작하기 전에
이 프로젝트는 VSCode와 NodeJS 8 에서의 개발 환경을 지원합니다. 이를 위해 다음과 같은 몇가지 프로그램들을 설치하고 진행해 주세요.

Git : https://git-scm.com/download/win

Visual Studio Code : https://code.visualstudio.com/docs/?dv=win

NodeJS v8.0 이상 : https://nodejs.org/ko/download/

### 2. 소스 다운로드 및 VSCode 연동
cmd 또는 git bash에서 다음 명령어들을 차례로 실행합니다.
```
git clone https://github.com/bitofsky/Loop-Timer.git
cd Loop-Timer
npm install
```

### 3. 소스 컴파일 및 실행
VSCode에서 F5를 눌러 런쳐를 구동시키면 동작합니다.

### 4. 배포용 빌드 생성
```
npm run build
```
실행 후 dist/ 디렉토리 안에 .exe 파일이 생성됩니다.
