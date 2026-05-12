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

    @Autowired
    private EmailSender emailSender;

    private static final int MIN_AGE = 18;

    @Transactional
    public String signup(SignupRequestDTO signupRequest, MultipartFile profileFile) {
        try {
            User user = signupRequest.getUser();

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

            if (profileFile != null && !profileFile.isEmpty()) {
                Map uploadParams = ObjectUtils.asMap(
                        "folder", "withday/profiles", "use_filename", true, "unique_filename", true);
                Map uploadResult = cloudinary.uploader().upload(profileFile.getBytes(), uploadParams);
                user.setProfileImage((String) uploadResult.get("secure_url"));
            }

            User existingUser = userDao.findByEmail(user.getEmail());
            if (existingUser != null) {
                throw new RuntimeException("이미 해당 이메일로 가입된 계정이 존재합니다.");
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userDao.insertUser(user);

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

    // 💡 구글 로그인 (유령 계정을 만들지 않고 신호만 주는 최신 버전!)
    @Transactional
    public Map<String, Object> googleLogin(Map<String, String> googleData) {
        String email = googleData.get("email");
        User dbUser = userDao.findByEmail(email);

        Map<String, Object> responseData = new HashMap<>();

        if (dbUser == null) {
            // DB에 없으면 계정을 만들지 않고 프론트엔드에 '등록 안됨' 신호만 보냅니다.
            responseData.put("isRegistered", false);
            return responseData;
        }

        // 기존 유저라면 정상적으로 토큰을 발급합니다.
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

    public List<Terms> getAllTerms() {
        return userDao.getAllTerms();
    }

    public String sendVerificationEmail(String receiverEmail) {
        Random r = new Random();
        StringBuilder sb = new StringBuilder();
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

        emailSender.sendMail(emailTitle, receiverEmail, emailContent);

        return authCode;
    }

    // 💡 소셜 로그인 전용 "진짜 회원가입" 로직 (유저가 폼을 다 채운 마지막에 호출됨)
    @Transactional
    public String socialSignup(SignupRequestDTO signupRequest) {
        try {
            User user = signupRequest.getUser();

            // 1. 나이 검증
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
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // 가짜 비번
            userDao.insertUser(user);

            // 4. 약관 동의 내역 저장
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