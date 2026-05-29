export const getCroppedImg = (imageSrc, cropPixels) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = "anonymous";

        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = cropPixels.width;
            canvas.height = cropPixels.height;

            ctx.drawImage(
                image,
                cropPixels.x,
                cropPixels.y,
                cropPixels.width,
                cropPixels.height,
                0,
                0,
                cropPixels.width,
                cropPixels.height
            );

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("이미지 변환에 실패했습니다."));
                        return;
                    }

                    const file = new File([blob], "profile-image.jpg", {
                        type: "image/jpeg",
                    });

                    resolve(file);
                },
                "image/jpeg",
                0.92
            );
        };

        image.onerror = () => {
            reject(new Error("이미지를 불러오지 못했습니다."));
        };
    });
};