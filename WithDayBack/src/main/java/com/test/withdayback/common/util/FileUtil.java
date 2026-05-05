package com.test.withdayback.common.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class FileUtil {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        // 1. 저장할 폴더가 없으면 생성
        File directory = new File(uploadDir);
        if (!directory.exists()) directory.mkdirs();

        // 2. 파일명 중복 방지를 위해 UUID 생성 (예: uuid_originalName.jpg)
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // 3. 파일 저장
        Path path = Paths.get(uploadDir + File.separator + fileName);
        Files.write(path, file.getBytes());

        // 4. DB에 저장할 '파일명' 혹은 '경로' 반환
        return fileName;
    }
}