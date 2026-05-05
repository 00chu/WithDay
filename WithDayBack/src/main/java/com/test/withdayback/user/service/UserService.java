package com.test.withdayback.user.service;

import com.test.withdayback.common.util.FileUtil;
import com.test.withdayback.user.dao.UserDao;
import com.test.withdayback.user.dto.SignupRequestDTO;
import com.test.withdayback.user.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException; // 💡 필수 임포트!

@Service
public class UserService {

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private FileUtil fileUtil;

    public String signup(SignupRequestDTO signupRequest, MultipartFile profileFile) {
        try {
            User user = signupRequest.getUser();

            // 1. 파일 저장 로직 (프로필 이미지가 있을 경우)
            if (profileFile != null && !profileFile.isEmpty()) {
                String savedFileName = fileUtil.saveFile(profileFile);
                user.setProfileImage(savedFileName);
            }

            // 2. 비밀번호 암호화
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            // 3. DB 저장
            userDao.insertUser(user);
            return "success";

        } catch (IOException e) {
            // 파일 저장 실패 시 에러 발생
            throw new RuntimeException("프로필 이미지 저장 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    public String login(String email, String rawPassword) {
        User dbUser = userDao.findByEmail(email);

        if (dbUser == null || !passwordEncoder.matches(rawPassword, dbUser.getPassword())) {
            return null;
        }

        return "temporary-token-for-" + email;
    }
}