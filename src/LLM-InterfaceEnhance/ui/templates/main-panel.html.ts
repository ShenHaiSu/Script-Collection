/**
 * 主面板 HTML 模板
 *
 * 纯 HTML 结构，与样式和逻辑完全解耦
 * 使用导出函数而非导出常量，方便后续根据平台做差异化渲染
 */

/**
 * 渲染主面板 HTML
 *
 * @returns 主面板 HTML 字符串
 */
export function renderMainPanelHTML(): string {
  return `
    <div class="llm-enhance-header">
      <h1>LLM 使用情况面板</h1>
      <div class="llm-enhance-controls">
        <button id="llm-enhance-refresh">刷新数据</button>
        <button id="llm-enhance-toggle-original">显示原始界面</button>
        <button id="llm-enhance-settings">设置</button>
      </div>
    </div>
    
    <div class="llm-enhance-content">
      <div class="llm-enhance-stats">
        <div class="stat-card">
          <h3>总使用量</h3>
          <p id="total-usage">0</p>
        </div>
        <div class="stat-card">
          <h3>总费用</h3>
          <p id="total-cost">$0.00</p>
        </div>
        <div class="stat-card">
          <h3>请求数</h3>
          <p id="total-requests">0</p>
        </div>
      </div>
      
      <div class="llm-enhance-table-container">
        <table id="usage-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>模型</th>
              <th>输入Token</th>
              <th>输出Token</th>
              <th>费用</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody id="usage-table-body">
            <!-- 动态填充 -->
          </tbody>
        </table>
      </div>
      
      <div class="llm-enhance-footer">
        <p>数据最后更新: <span id="last-update">-</span></p>
        <p>拦截的请求数: <span id="intercepted-count">0</span></p>
      </div>
    </div>
  `;
}
