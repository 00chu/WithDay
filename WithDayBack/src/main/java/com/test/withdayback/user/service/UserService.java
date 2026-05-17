package com.test.withdayback.user.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.test.withdayback.common.util.EmailSender;
import com.test.withdayback.common.util.JwtUtil;
import com.test.withdayback.user.dao.UserDao;
import com.test.withdayback.user.dto.SignupRequestDTO;
import com.test.withdayback.user.vo.Terms;
import com.test.withdayback.user.vo.User;
import com.test.withdayback.user.vo.UserTerms;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;

// 💡 @Service: 스프링 부트에게 "이 클래스는 비즈니스 로직(실제 기능 구현)을 담당하는 요리사야!"라고 알려줌.
@Service
public class UserService {

    @Autowired
    private UserDao userDao; // DB 창고 관리자 (MyBatis)

    @Autowired
    private BCryptPasswordEncoder passwordEncoder; // 비밀번호 암호화 도구

    @Autowired
    private JwtUtil jwtUtil; // 토큰 발급 도구

    @Autowired
    private Cloudinary cloudinary; // 이미지 호스팅 서버 (프로필 사진 저장용)

    @Autowired
    private EmailSender emailSender; // 이메일 발송 도구

    private static final int MIN_AGE = 18; // 최소 가입 연령 제한

    // ==========================================
    // 1. 일반 회원가입 로직
    // ==========================================
    // 💡 @Transactional (초핵심 원리): '트랜잭션(Transaction)'은 "모두 성공하거나, 아니면 모두 실패해라(All or Nothing)"라는 뜻입니다.
    // 회원 정보는 DB에 넣었는데, 약관 동의 내역을 DB에 넣다가 에러가 났다?
    // 이 어노테이션이 있으면 스프링이 알아서 회원 정보 넣었던 것도 롤백(취소)시켜서 DB가 꼬이는 걸 완벽하게 막아줍니다.
    @Transactional
    public String signup(SignupRequestDTO signupRequest, MultipartFile profileFile) {
        try {
            User user = signupRequest.getUser();

            // [로직 1] 만 나이 서버 단에서 한 번 더 검증 (프론트에서 뚫려도 서버에서 막는 이중 방어 원칙)
            if (user.getBirthday() != null && !user.getBirthday().isEmpty()) {
                LocalDate birthDate = LocalDate.parse(user.getBirthday(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                LocalDate currentDate = LocalDate.now();
                int age = Period.between(birthDate, currentDate).getYears();

                if (age < MIN_AGE) {
                    throw new RuntimeException("만 " + MIN_AGE + "세 이상만 가입할 수 있습니다.");
                }
            }

            user.setProvider("local"); // 로컬(일반) 가입자라고 명시
            user.setProviderId("");

            // [로직 2] 프로필 사진이 있으면 Cloudinary 서버에 업로드 후, 받아온 이미지 링크(URL)를 DB에 저장
            if (profileFile != null && !profileFile.isEmpty()) {
                Map uploadParams = ObjectUtils.asMap(
                        "folder", "withday/profiles", "use_filename", true, "unique_filename", true);
                Map uploadResult = cloudinary.uploader().upload(profileFile.getBytes(), uploadParams);
                user.setProfileImage((String) uploadResult.get("secure_url"));
            }

            // [로직 3] 이메일 중복 검사
            User existingUser = userDao.findByEmail(user.getEmail());
            if (existingUser != null) {
                throw new RuntimeException("이미 해당 이메일로 가입된 계정이 존재합니다.");
            }

            // [로직 4] 비밀번호 암호화 (단방향 해시 암호화 원리)
            // 관리자도 유저의 실제 비밀번호를 알 수 없도록 무작위 문자열로 치환하여 DB에 저장합니다.
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // 유저 정보를 DB에 삽입! (이때 MyBatis가 insert를 실행하고 새로 생성된 유저의 PK(id) 값을 user 객체에 채워줌)
            userDao.insertUser(user);

            // [로직 5] 약관 동의 내역 분리 저장 (정규화 원리)
            // 유저 테이블 하나에 다 때려 넣지 않고, N:M 관계를 풀기 위해 UserTerms 테이블에 약관 종류별로 각각 insert 함
            Map<String, Boolean> terms = signupRequest.getTerms();
            if (terms != null && user.getId() != null) {
                for (Map.Entry<String, Boolean> entry : terms.entrySet()) {
                    UserTerms userTerms = new UserTerms();
                    userTerms.setUserId(((Number) user.getId()).longValue());

                    Long termsId = 0L;
                    switch (entry.getKey()) {
                        case "TOS": termsId = 1L; break;
                        case "PRIVACY": termsId = 2L; break;
                        case "MARKETING": termsId = 3L; break;
                    }

                    userTerms.setTermsId(termsId);
                    userTerms.setAgreed(entry.getValue());
                    userDao.insertUserTerms(userTerms); // 약관별로 DB insert
                }
            }
            return "success";

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    // ==========================================
    // 2. 일반 로그인 로직
    // ==========================================
    public Map<String, Object> login(String email, String rawPassword) {
        // DB에서 이메일로 유저 정보를 통째로 가져옴
        User dbUser = userDao.findByEmail(email);

        // 💡 암호화 비교 원리: rawPassword(유저가 입력한 1234)를 암호화해서 DB의 암호화된 값과 같은지 비교함.
        if (dbUser == null || !passwordEncoder.matches(rawPassword, dbUser.getPassword())) {
            return null; // 실패 시 null 반환 (Controller에서 401 에러로 처리됨)
        }

        // 로그인 성공! 서버가 "이 사람은 인증된 유저다"라는 보증수표(JWT 토큰)를 발급함.
        String token = jwtUtil.createToken(dbUser.getEmail(), dbUser.getNickname());

        // 프론트엔드 전역 금고(Zustand)에 들어갈 데이터 규격(Map)을 맞춰서 조립함.
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("token", token);

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("email", dbUser.getEmail());
        userInfo.put("nickname", dbUser.getNickname());
        userInfo.put("birthday", dbUser.getBirthday());
        userInfo.put("gender", dbUser.getGender());
        userInfo.put("postcode", dbUser.getPostcode());

        responseData.put("user", userInfo);
        return responseData;
    }

    // ==========================================
    // 3. 구글 로그인 로직 (신호등 역할)
    // ==========================================
    @Transactional
    public Map<String, Object> googleLogin(Map<String, String> googleData) {
        String email = googleData.get("email");
        User dbUser = userDao.findByEmail(email);

        Map<String, Object> responseData = new HashMap<>();

        if (dbUser == null) {
            // [분기점 1] DB에 유저가 없음 -> 아직 회원가입 안 한 사람!
            // DB에 가짜 계정을 함부로 만들지 않고, 프론트(Login.jsx)에게 "이 사람 정보 더 받아와!" 하고 신호(isRegistered: false)만 줌.
            responseData.put("isRegistered", false);
            return responseData;
        }

        // [분기점 2] DB에 유저가 있음 -> 이미 가입된 구글 유저! (로그인 성공 처리)
        String token = jwtUtil.createToken(dbUser.getEmail(), dbUser.getNickname());
        responseData.put("isRegistered", true);
        responseData.put("token", token);

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("email", dbUser.getEmail());
        userInfo.put("nickname", dbUser.getNickname());
        userInfo.put("birthday", dbUser.getBirthday());
        userInfo.put("gender", dbUser.getGender());
        userInfo.put("postcode", dbUser.getPostcode());
        userInfo.put("profileImage", dbUser.getProfileImage());

        responseData.put("user", userInfo);
        return responseData;
    }

    // ==========================================
    // 4. DB에서 약관 리스트 불러오기
    // ==========================================
    public List<Terms> getAllTerms() {
        return userDao.getAllTerms();
    }

    // ==========================================
    // 5. 이메일 인증번호 발송 로직
    // ==========================================
    public String sendVerificationEmail(String receiverEmail) {
        Random r = new Random();
        StringBuilder sb = new StringBuilder();
        // 영문자 + 숫자 혼합된 6자리 랜덤 난수(인증번호) 생성 로직
        for (int i = 0; i < 6; i++) {
            int flag = r.nextInt(3);
            if (flag == 0) sb.append(r.nextInt(10));
            else if (flag == 1) sb.append((char) (r.nextInt(26) + 65));
            else sb.append((char) (r.nextInt(26) + 97));
        }
        String authCode = sb.toString();

        String emailTitle = "[WithDay] 회원가입 이메일 인증번호입니다.";
        String emailContent = "<h1>안녕하세요. WithDay 입니다.</h1>"
                + "<h3>인증번호는 [ <b style='color:#007BFF;'>" + authCode + "</b> ] 입니다.</h3>"
                + "<h3>화면으로 돌아가 인증번호를 입력해 주세요.</h3>";

        // 생성된 내용으로 실제 메일 발송
        emailSender.sendMail(emailTitle, receiverEmail, emailContent);

        // 프론트엔드가 유저 입력값과 비교할 수 있게 생성된 코드를 반환
        return authCode;
    }

    // ==========================================
    // 6. 소셜 로그인 전용 "진짜 회원가입" 로직
    // ==========================================
    @Transactional // 여기도 All or Nothing 보장!
    public String socialSignup(SignupRequestDTO signupRequest) {
        try {
            User user = signupRequest.getUser();

            // 1. 나이 검증 (서버 이중 검증)
            if (user.getBirthday() != null && !user.getBirthday().isEmpty()) {
                LocalDate birthDate = LocalDate.parse(user.getBirthday(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                LocalDate currentDate = LocalDate.now();
                int age = Period.between(birthDate, currentDate).getYears();
                if (age < MIN_AGE) {
                    throw new RuntimeException("만 " + MIN_AGE + "세 이상만 가입할 수 있습니다.");
                }
            }

            // 2. 이중 가입 방어
            User existingUser = userDao.findByEmail(user.getEmail());
            if (existingUser != null) {
                throw new RuntimeException("이미 해당 이메일로 가입된 계정이 존재합니다.");
            }

            // 3. 소셜 유저 기본 세팅 후 DB에 완전한 형태로 INSERT
            user.setProvider("google");

            // 💡 [핵심 원리] 소셜 로그인은 비밀번호가 필요 없지만, DB 테이블 설계상 password 컬럼이 'NOT NULL(필수)'일 가능성이 높음.
            // 그래서 절대 추측 불가능한 램덤 무작위 난수(UUID)를 만들어서 암호화한 뒤 억지로 채워 넣는 방식을 사용함.
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

            userDao.insertUser(user);

            // 4. 약관 동의 내역 저장 (일반 가입과 원리 동일)
            Map<String, Boolean> terms = signupRequest.getTerms();
            if (terms != null && user.getId() != null) {
                for (Map.Entry<String, Boolean> entry : terms.entrySet()) {
                    UserTerms userTerms = new UserTerms();
                    userTerms.setUserId(((Number) user.getId()).longValue());
                    Long termsId = 0L;
                    switch (entry.getKey()) {
                        case "TOS": termsId = 1L; break;
                        case "PRIVACY": termsId = 2L; break;
                        case "MARKETING": termsId = 3L; break;
                    }
                    userTerms.setTermsId(termsId);
                    userTerms.setAgreed(entry.getValue());
                    userDao.insertUserTerms(userTerms);
                }
            }
            return "success";
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }
}