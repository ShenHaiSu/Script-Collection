/**
 * 主界面 CSS 样式
 *
 * 包含面板、统计卡片、表格、页脚等所有主界面样式
 * 采用导出常量模式，通过 GM_addStyle 注入
 */

export const MAIN_STYLES = `
  /* 主容器 */
  #llm-enhance-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: #f5f5f5;
    min-height: 100vh;
  }
  
  /* 头部 */
  .llm-enhance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .llm-enhance-header h1 {
    margin: 0;
    color: #333;
    font-size: 24px;
  }
  
  /* 控制按钮组 */
  .llm-enhance-controls {
    display: flex;
    gap: 10px;
  }
  
  .llm-enhance-controls button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }
  
  .llm-enhance-controls button:hover {
    background: #0056b3;
  }
  
  /* 内容区域 */
  .llm-enhance-content {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  /* 统计卡片网格 */
  .llm-enhance-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
    text-align: center;
    border: 1px solid #e9ecef;
  }
  
  .stat-card h3 {
    margin: 0 0 10px 0;
    color: #6c757d;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .stat-card p {
    margin: 0;
    font-size: 28px;
    font-weight: bold;
    color: #495057;
  }
  
  /* 表格容器 */
  .llm-enhance-table-container {
    overflow-x: auto;
    margin-bottom: 20px;
  }
  
  #usage-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  #usage-table th,
  #usage-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
  
  #usage-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #495057;
    position: sticky;
    top: 0;
  }
  
  #usage-table tr:hover {
    background: #f8f9fa;
  }
  
  /* 页脚 */
  .llm-enhance-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid #dee2e6;
    color: #6c757d;
    font-size: 12px;
  }
  
  /* 响应式设计 - 平板 */
  @media (max-width: 768px) {
    .llm-enhance-header {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }
    
    .llm-enhance-controls {
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .llm-enhance-stats {
      grid-template-columns: 1fr;
    }
    
    .llm-enhance-footer {
      flex-direction: column;
      gap: 5px;
      text-align: center;
    }
  }
  
  /* 响应式设计 - 手机 */
  @media (max-width: 480px) {
    #llm-enhance-container {
      padding: 10px;
    }
    
    .llm-enhance-header h1 {
      font-size: 20px;
    }
    
    .llm-enhance-controls button {
      padding: 6px 12px;
      font-size: 12px;
    }
    
    .stat-card p {
      font-size: 24px;
    }
  }

  /* 入口切换按钮 */
  #llm-enhance-toggle-btn {
    position: fixed;
    top: 8px;
    right: 20px;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    background: rgb(0, 0, 0);
    color: white;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    transition: background 0.2s, transform 0.1s;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    line-height: 1;
  }

  #llm-enhance-toggle-btn:hover {
    background: rgb(40, 40, 40);
    transform: scale(1.05);
  }

  #llm-enhance-toggle-btn:active {
    transform: scale(0.95);
  }
`;
