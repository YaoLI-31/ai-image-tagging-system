// DOM元素
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadBtn = document.getElementById('uploadBtn');
const previewImage = document.getElementById('previewImage');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const analyzeBtn = document.getElementById('analyzeBtn');
const resetBtn = document.getElementById('resetBtn');
const tagsContainer = document.getElementById('tagsContainer');
const tagsDescription = document.getElementById('tagsDescription');
const loading = document.getElementById('loading');
const gallery = document.getElementById('gallery');

// 当前图片数据
let currentImageData = null;

// 示例图片库数据
const exampleImages = [
    {
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        tags: ['山峰', '云海', '日出', '自然景观', '户外']
    },
    {
        url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        tags: ['咖啡', '早餐', '杯子', '糕点', '早晨']
    },
    {
        url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        tags: ['书籍', '阅读', '学习', '知识', '图书馆']
    },
    {
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        tags: ['城市', '建筑', '夜景', '灯光', '都市']
    },
    {
        url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        tags: ['猫咪', '宠物', '动物', '毛茸茸', '家居']
    }
];

// 初始化示例图片库
function initGallery() {
    exampleImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${image.url}" alt="示例图片 ${index + 1}">
            <div class="gallery-tags">
                ${image.tags.map(tag => `<span class="gallery-tag">${tag}</span>`).join('')}
            </div>
        `;
        
        galleryItem.addEventListener('click', () => {
            // 使用示例图片
            useExampleImage(image.url, image.tags);
        });
        
        gallery.appendChild(galleryItem);
    });
}

// 使用示例图片 - 修改后的版本
async function useExampleImage(url, tags) {
    // 显示预览
    previewImage.src = url;
    previewImage.style.display = 'block';
    previewPlaceholder.style.display = 'none';
    
    // 更新描述
    tagsDescription.textContent = '正在分析示例图片...';
    tagsContainer.innerHTML = '';
    
    // --- 关键修改：改为尝试调用真实API分析这张网络图片 ---
    loading.style.display = 'block';
    try {
        // 注意：这里需要先将网络图片URL转换为Base64，或你的后端需支持URL分析
        // 以下是思路提示，实现较复杂，你可以选择先保留旧逻辑，或暂时清空此函数
        console.warn('useExampleImage 函数需要改造以支持真实API');
        // 暂时先回退到显示示例标签（保持旧逻辑）
        generateTags(tags.map(tag => ({
            keyword: tag,
            score: (Math.random() * 0.3 + 0.7).toFixed(2)
        })));
    } finally {
        loading.style.display = 'none';
    }
}

// 优化的标签分类函数（建议使用此版本）
function categorizeTag(keyword, root = '') {
    // 优先使用百度AI返回的`root`字段进行判断，更准确
    const rootLower = root.toLowerCase();
    const keywordLower = keyword.toLowerCase();

    // 1. 使用 root 进行主要分类判断
    if (rootLower.includes('动物') || rootLower.includes('宠物')) return 'animal';
    if (rootLower.includes('菜品') || rootLower.includes('食物')) return 'food';
    if (rootLower.includes('场景') || rootLower.includes('自然风景') || rootLower.includes('建筑')) return 'scene';
    if (rootLower.includes('商品')) return 'object';

    // 2. 如果root信息不明确，再降级到关键词匹配（作为后备方案）
    const animals = ['猫', '狗', '鸟', '鱼', '动物', '宠物', '老虎', '狮子', '马', '牛', '兔'];
    const foods = ['食物', '菜', '饭', '水果', '蔬菜', '肉', '餐厅', '咖啡', '饮料', '蛋糕', '面包'];
    const scenes = ['风景', '建筑', '城市', '自然', '山水', '天空', '海洋', '街道', '公园', '森林', '山', '河'];
    const objects = ['手机', '电脑', '书', '车', '家具', '电器', '工具', '设备', '衣服', '鞋', '包', '眼镜'];

    if (animals.some(animal => keywordLower.includes(animal))) return 'animal';
    if (foods.some(food => keywordLower.includes(food))) return 'food';
    if (scenes.some(scene => keywordLower.includes(scene))) return 'scene';
    if (objects.some(obj => keywordLower.includes(obj))) return 'object';

    // 3. 如果都无法匹配，则归为通用类
    return 'general';
}

// 事件监听器
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

analyzeBtn.addEventListener('click', async () => {
    console.log('[调试] 点击了“分析”按钮');
    console.log('[调试] currentImageData的值是:', currentImageData ? '有数据' : 'null/undefined');
    
    if (!currentImageData) {
        alert('请先上传图片！');
        return;
    }

    const file = fileInput.files[0];
    console.log('[调试] 从input获取的文件对象:', file ? `类型:${file.type}, 大小:${file.size}字节` : '无文件');

    loading.style.display = 'block';
    analyzeBtn.disabled = true;
    
    try {
    console.log('[调试] 开始调用真实API...');
    
    // 1. 获取Base64字符串（去掉“data:image/...;base64,”前缀）
    const base64Data = currentImageData.split(',')[1]; // 这是我们需要的纯Base64
    
    // 2. 调用【你自己的后端API】，地址是 localhost:3000
    const response = await fetch('http://localhost:3000/api/analyze/general', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // 明确告诉后端发送的是JSON
        },
        body: JSON.stringify({
            imageBase64: base64Data // 字段名必须和后端接口定义的一致
        })
    });

    console.log('[调试] 收到响应，状态码:', response.status);
    
    if (!response.ok) {
        // 如果响应状态码不是200-299，尝试读取错误信息
        const errorText = await response.text();
        throw new Error(`后端请求失败 (${response.status}): ${errorText}`);
    }

    // 3. 解析你的后端返回的JSON
    const result = await response.json();
    console.log('[调试] 后端返回结果:', result);

    // 4. 处理后端返回的数据
    // 根据你的后端server.js，成功时返回 { success: true, data: ... }
    if (result.success && result.data && result.data.result) {
        // 百度AI的原始结果在 result.data 里
        const tags = result.data.result.map(item => ({
            keyword: item.keyword,
            score: item.score,
            // 修改这一行，传入第二个参数 item.root
            category: categorizeTag(item.keyword, item.root) // 添加 item.root
        }));
        
        tagsContainer.innerHTML = '';
        tagsDescription.textContent = `AI识别完成，共发现 ${result.data.result_num} 个标签`;
        generateTags(tags);
        
    } else {
        // 处理后端返回的错误（如百度API密钥无效）
        throw new Error(result.error || '识别失败，未知错误');
    }

} catch (error) {
    console.error('[调试] 整个请求过程发生错误:', error);
    alert(`分析失败: ${error.message}`);
    // 可选：在这里回退到模拟数据
    // useMockDataAsFallback(); 
}finally { // <--- 这是必须添加的！
    loading.style.display = 'none';
    analyzeBtn.disabled = false;
}});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary-color)';
    uploadArea.style.backgroundColor = 'var(--primary-light)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--border-color)';
    uploadArea.style.backgroundColor = 'var(--light-color)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--border-color)';
    uploadArea.style.backgroundColor = 'var(--light-color)';
    
    if (e.dataTransfer.files.length) {
        handleImageUpload(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleImageUpload(e.target.files[0]);
    }
});



resetBtn.addEventListener('click', () => {
    resetApp();
});

// 处理图片上传
function handleImageUpload(file) {
    // 检查文件类型
    if (!file.type.match('image.*')) {
        alert('请选择图片文件！');
        return;
    }
    
    // 检查文件大小（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB！');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        // 显示预览
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
        previewPlaceholder.style.display = 'none';
        
        // 保存图片数据
        currentImageData = e.target.result;
        
        // 清空之前的标签
        tagsContainer.innerHTML = '';
        
        // 更新描述
        tagsDescription.textContent = '图片已上传，点击"AI分析图片标签"按钮开始分析。';
    };
    
    reader.readAsDataURL(file);
}



// 生成标签元素
function generateTags(tags) {
    tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = `tag ${tag.category || 'object'}`;
        
        // 根据置信度设置标签大小
        const fontSize = 0.9 + (tag.score * 0.3);
        tagElement.style.fontSize = `${fontSize}rem`;
        
        tagElement.innerHTML = `
            <i class="fas fa-tag"></i>
            <span>${tag.keyword}</span>
            <span class="tag-confidence">${(tag.score * 100).toFixed(1)}%</span>
        `;
        
        tagsContainer.appendChild(tagElement);
    });
}

// 重置应用
function resetApp() {
    // 清空文件输入
    fileInput.value = '';
    
    // 隐藏预览图片
    previewImage.src = '';
    previewImage.style.display = 'none';
    previewPlaceholder.style.display = 'block';
    
    // 清空标签
    tagsContainer.innerHTML = '';
    
    // 重置描述
    tagsDescription.textContent = '上传图片并点击"AI分析图片标签"按钮，系统将使用百度AI图像识别技术为图片生成标签。';
    
    // 重置当前图片数据
    currentImageData = null;
    
    // 隐藏加载动画
    loading.style.display = 'none';
    analyzeBtn.disabled = false;
}

// 初始化应用
function initApp() {
    initGallery();
    resetApp();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);