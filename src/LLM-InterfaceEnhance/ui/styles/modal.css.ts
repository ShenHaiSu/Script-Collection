/**
 * 模态框/弹窗 CSS 样式
 *
 * 包含设置弹窗等模态框的样式
 */

export const MODAL_STYLES = `
  /* 模态框容器 */
  #llm-enhance-settings-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
  }
  
  /* 遮罩层 */
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 弹窗内容 */
  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  
  .modal-content h2 {
    margin-top: 0;
    color: #333;
  }
  
  /* 设置项组 */
  .setting-group {
    margin-bottom: 15px;
  }
  
  .setting-group label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  
  .setting-group input[type="number"] {
    width: 80px;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  /* 弹窗按钮组 */
  .modal-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }
  
  .modal-buttons button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  #save-settings {
    background: #28a745;
    color: white;
  }
  
  #cancel-settings {
    background: #6c757d;
    color: white;
  }
`;
