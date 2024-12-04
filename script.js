class Watermarker {
    constructor() {
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.image = null;
        
        // 设置默认日期为今天
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        document.getElementById('dateInput').value = `${year}-${month}-${day}`;
        
        // 优化移动端时间日期输入
        this.setupDateTimeInputs();
    }

    setupEventListeners() {
        // 文件选择按钮
        document.getElementById('selectButton').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });

        // 文件输入变化
        document.getElementById('imageInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('fileName').textContent = file.name;
                this.loadImage(file);
            }
        });

        // 添加水印按钮
        document.getElementById('addWatermark').addEventListener('click', () => {
            if (!this.image) {
                alert('请先选择图片！');
                return;
            }
            this.addWatermark();
        });
    }

    setupDateTimeInputs() {
        const timeInput = document.getElementById('timeInput');
        const dateInput = document.getElementById('dateInput');

        // 检测是否为移动设备
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            // 时间输入优化
            timeInput.addEventListener('touchstart', (e) => {
                e.target.focus();
            });

            // 日期输入优化
            dateInput.addEventListener('touchstart', (e) => {
                e.target.focus();
            });

            // 添加输入完成时的视觉反馈
            [timeInput, dateInput].forEach(input => {
                input.addEventListener('change', () => {
                    input.blur();
                });
            });
        }
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.image = new Image();
            this.image.onload = () => {
                this.canvas.width = this.image.width;
                this.canvas.height = this.image.height;
                this.ctx.drawImage(this.image, 0, 0);
                
                this.originalWidth = this.image.width;
                this.originalHeight = this.image.height;
            };
            this.image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    addWatermark() {
        // 清除画布并重新绘制原图
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0);

        const timeStr = document.getElementById('timeInput').value || this.getCurrentTime();
        const dateStr = document.getElementById('dateInput').value || this.getCurrentDate();
        const watermarkText = document.getElementById('textInput').value;
        const weekdayStr = this.getWeekday(dateStr);

        // 使用原始图片宽度计算比例
        const scaleFactor = Math.max(this.originalWidth / 1000, 0.5);
        
        // 设置字体样式
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // 基础字体大小
        const baseTimeFontSize = 80;
        const baseNormalFontSize = 32;
        
        // 计算实际字体大小
        const timeFontSize = Math.round(baseTimeFontSize * scaleFactor);
        const normalFontSize = Math.round(baseNormalFontSize * scaleFactor);
        
        // 计算基础边距
        const baseBottomMargin = 60;
        const baseLeftMargin = 50;
        const baseLineWidth = 8;
        
        // 计算实际边距
        const bottomMargin = baseBottomMargin * scaleFactor;
        const leftMargin = baseLeftMargin * scaleFactor;
        
        // 绘制时间
        this.ctx.font = `${timeFontSize}px Microsoft YaHei`;
        const timeWidth = this.ctx.measureText(timeStr).width;
        this.ctx.fillText(timeStr, leftMargin, this.canvas.height - bottomMargin);

        // 绘制黄色分割线
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#F3CB41';
        this.ctx.lineWidth = baseLineWidth * scaleFactor;
        const lineX = leftMargin + timeWidth + (15 * scaleFactor);
        this.ctx.moveTo(lineX, this.canvas.height - bottomMargin - (70 * scaleFactor));
        this.ctx.lineTo(lineX, this.canvas.height - bottomMargin + (10 * scaleFactor));
        this.ctx.stroke();

        // 绘制日期和星期
        this.ctx.font = `${normalFontSize}px Microsoft YaHei`;
        const dateY = this.canvas.height - bottomMargin - (30 * scaleFactor);
        const weekdayY = this.canvas.height - bottomMargin;
        
        this.ctx.fillText(dateStr.replace(/-/g, '.'), lineX + (20 * scaleFactor), dateY);
        this.ctx.fillText(weekdayStr, lineX + (20 * scaleFactor), weekdayY);

        // 绘制自定义文字
        if (watermarkText) {
            const textWidth = this.ctx.measureText(watermarkText).width;
            this.ctx.fillText(watermarkText, 
                this.canvas.width - textWidth - (50 * scaleFactor), 
                this.canvas.height - bottomMargin);
        }

        // 更新下载链接
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = this.canvas.toDataURL('image/png');
        downloadLink.style.display = 'block';
        downloadLink.classList.add('show');
    }

    getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + 
               now.getMinutes().toString().padStart(2, '0');
    }

    getCurrentDate() {
        const now = new Date();
        return now.getFullYear() + '.' + 
               (now.getMonth() + 1).toString().padStart(2, '0') + '.' + 
               now.getDate().toString().padStart(2, '0');
    }

    getWeekday(dateStr) {
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        const date = new Date(dateStr.replace(/\./g, '-'));
        return '星期' + weekdays[date.getDay()];
    }
}

// 初始化水印工具
window.addEventListener('DOMContentLoaded', () => {
    new Watermarker();
}); 