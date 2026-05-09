package com.test.withdayback.user.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID; // 💡 임의의 비밀번호 생성을 위해 추가

@Service
public class UserService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private Cloudinary cloudinary;

    // 💡 제한할 나이 설정
    private static final int MIN_AGE = 18;

    @Transactional
    public String signup(SignupRequestDTO signupRequest, MultipartFile profileFile) {
        try {
            User user = signupRequest.getUser();

            // 백엔드 나이 검증: 프론트 우회 가입 방지 (만 나이 계산)
            if (user.getBirthday() != null && !user.getBirthday().isEmpty()) {
                LocalDate birthDate = LocalDate.parse(user.getBirthday(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                LocalDate currentDate = LocalDate.now();
                int age = Period.between(birthDate, currentDate).getYears();

                if (age < MIN_AGE) {
                    throw new RuntimeException("만 " + MIN_AGE + "세 이상만 가입할 수 있습니다.");
                }
            }

            user.setProvider("local");
            user.setProviderId("");

            // 1. 프로필 이미지 Cloudinary 업로드
            if (profileFile != null && !profileFile.isEmpty()) {
                Map uploadParams = ObjectUtils.asMap(
                        "folder", "withday/profiles", "use_filename", true, "unique_filename", true);
                Map uploadResult = cloudinary.uploader().upload(profileFile.getBytes(), uploadParams);
                user.setProfileImage((String) uploadResult.get("secure_url"));
            }

            // 2. 유저 정보 저장
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userDao.insertUser(user);

            // 3. 약관 동의 내역 저장
            Map<String, Boolean> terms = signupRequest.getTerms();
            if (terms != null && user.getId() != null) {
                for (Map.Entry<String, Boolean> entry : terms.entrySet()) {
                    UserTerms userTerms = new UserTerms();

                    userTerms.setUserId(((Number) user.getId()).longValue());

                    Long termsId = 0L;
                    switch (entry.getKey()) {
                        case "TOS":
                            termsId = 1L;
                            break;
                        case "PRIVACY":
                            termsId = 2L;
                            break;
                        case "MARKETING":
                            termsId = 3L;
                            break;
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

    public Map<String, Object> login(String email, String rawPassword) {
        User dbUser = userDao.findByEmail(email);

        if (dbUser == null || !passwordEncoder.matches(rawPassword, dbUser.getPassword())) {
            return null;
        }

        String token = jwtUtil.createToken(dbUser.getEmail(), dbUser.getNickname());

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

    // 💡 구글 로그인 & 자동 회원가입 로직 추가
    @Transactional
    public Map<String, Object> googleLogin(Map<String, String> googleData) {
        String email = googleData.get("email");
        User dbUser = userDao.findByEmail(email);

        // 1. DB에 해당 이메일이 없다면? -> 구글 정보로 즉시 회원가입 진행
        if (dbUser == null) {
            dbUser = new User();
            dbUser.setEmail(email);
            dbUser.setNickname(googleData.get("nickname"));
            dbUser.setProvider("google");
            dbUser.setProviderId(googleData.get("providerId"));
            dbUser.setProfileImage(googleData.get("profileImage"));

            // 소셜 로그인은 비밀번호를 안 쓰지만, DB 규칙을 위해 랜덤 비밀번호 암호화 저장
            dbUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

            // 구글에서 제공하지 않는 빈 값들 초기화 방어
            dbUser.setBirthday("");
            dbUser.setGender(0);
            dbUser.setPhone("");
            dbUser.setPostcode("");
            dbUser.setAddress("");
            dbUser.setDetailAddress("");

            userDao.insertUser(dbUser);
        }

        // 2. 가입된(혹은 방금 가입한) 유저 정보로 JWT 토큰 발급
        String token = jwtUtil.createToken(dbUser.getEmail(), dbUser.getNickname());

        Map<String, Object> responseData = new HashMap<>();
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

    public List<Terms> getAllTerms() {
        return userDao.getAllTerms();
    }
}