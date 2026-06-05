package com.test.withdayback.user.dao;

import com.test.withdayback.user.dto.FindAccountDTO;
import com.test.withdayback.user.vo.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@MybatisTest
@ActiveProfiles("test")
class UserDaoAdminStatusTest {

    @Autowired
    private UserDao userDao;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("DROP TABLE IF EXISTS user_interest");
        jdbcTemplate.execute("DROP TABLE IF EXISTS user_terms");
        jdbcTemplate.execute("DROP TABLE IF EXISTS interests");
        jdbcTemplate.execute("DROP TABLE IF EXISTS terms");
        jdbcTemplate.execute("DROP TABLE IF EXISTS `user`");
        jdbcTemplate.execute("""
                CREATE TABLE `user` (
                    id BIGINT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    password VARCHAR(255) NULL,
                    provider VARCHAR(50) NULL,
                    provider_id VARCHAR(255) NULL,
                    nickname VARCHAR(255) NULL,
                    profile_image VARCHAR(255) NULL,
                    birthday VARCHAR(20) NULL,
                    gender INT NULL,
                    phone VARCHAR(50) NULL,
                    status VARCHAR(20) NULL,
                    postcode VARCHAR(50) NULL,
                    address VARCHAR(255) NULL,
                    detail_address VARCHAR(255) NULL,
                    created_at TIMESTAMP NULL
                )
                """);
        jdbcTemplate.update(
                """
                INSERT INTO `user` (
                    id, email, password, provider, provider_id, nickname,
                    profile_image, birthday, gender, phone, status,
                    postcode, address, detail_address, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
                """,
                1L, "admin@withday.test", "before-password", "local", "", "admin-user",
                null, null, null, "010-1111-2222", "admin", null, null, null
        );
    }

    @Test
    void findByNicknameAndPhoneIncludesAdminStatusUser() {
        User result = userDao.findByNicknameAndPhone(
                new FindAccountDTO("admin-user", "010-1111-2222", null, null, null)
        );

        assertNotNull(result);
        assertEquals("admin@withday.test", result.getEmail());
    }

    @Test
    void updatePasswordUpdatesAdminStatusUser() {
        userDao.updatePassword("admin@withday.test", "after-password");

        String storedPassword = jdbcTemplate.queryForObject(
                "SELECT password FROM `user` WHERE email = ?",
                String.class,
                "admin@withday.test"
        );

        assertEquals("after-password", storedPassword);
    }
}
