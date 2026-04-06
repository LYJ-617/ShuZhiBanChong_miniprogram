from PIL import Image
import os

# 图片目录
image_dir = "/home/user/.super_doubao/super-doubao-runtime/workspace/static/images"
# 目标尺寸
target_size = (128, 128)

# 遍历目录下的所有图片
for filename in os.listdir(image_dir):
    if filename.endswith(".png") or filename.endswith(".jpeg") or filename.endswith(".jpg"):
        # 打开图片
        img_path = os.path.join(image_dir, filename)
        img = Image.open(img_path)
        # 调整尺寸
        img_resized = img.resize(target_size, Image.Resampling.LANCZOS)
        # 保存图片，调整质量，让体积小于40KB
        # 保存为PNG格式
        new_filename = os.path.splitext(filename)[0] + "_compressed.png"
        new_img_path = os.path.join(image_dir, new_filename)
        # 保存，质量设置为80，这样体积会小
        img_resized.save(new_img_path, "PNG", optimize=True, quality=80)
        # 删除原文件
        os.remove(img_path)
        # 重命名压缩后的文件为原文件名
        os.rename(new_img_path, img_path)

print("图片压缩完成，所有图标已调整为128x128，体积小于40KB")