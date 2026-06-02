/**
 * 设置弹窗 HTML 模板
 *
 * 纯 HTML 结构，与样式和逻辑完全解耦
 */

/**
 * 渲染设置弹窗 HTML
 *
 * @returns 设置弹窗 HTML 字符串
 */
export function renderSettingsModalHTML(): string {
  return `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>设置</h2>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="auto-refresh" checked> 自动刷新数据
          </label>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="show-notifications" checked> 显示通知
          </label>
        </div>
        <div class="setting-group">
          <label>
            刷新间隔（秒）:
            <input type="number" id="refresh-interval" value="30" min="5" max="300">
          </label>
        </div>
        <div class="modal-buttons">
          <button id="save-settings">保存</button>
          <button id="cancel-settings">取消</button>
        </div>
      </div>
    </div>
  `;
}
