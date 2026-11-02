/*
 * 作者：王传淞
 * 建立时间：2026-11-02 13:40:08
 * 使用模型：Kimi-K3
 * 功能名称：可复用 Tab 选项卡组件
 * 简介：对外提供 wcs810_initTabs 初始化函数，可为页面中任意符合结构
 *       （按钮 .wcs810_tab-btn + 面板 .wcs810_tab-panel，按钮通过
 *       data-wcs810-target 指向面板选择器）的选项卡容器绑定点击事件，
 *       切换时先清除所有选项卡与面板的选中状态，再设置当前元素的选中状态。
 */

/*
 * 作者：王传淞
 * 建立时间：2026-11-02 13:40:08
 * 使用模型：Kimi-K3
 * 功能名称：设置当前选中项
 * 简介：先清除所有选项卡按钮与面板的 wcs810_active 选中状态，
 *       再为当前点击的按钮及其 data-wcs810-target 指向的面板添加选中状态。
 */
function wcs810_activateTab(wcs810_tabs, wcs810_panels, wcs810_currentBtn) {
  // 1. 清除所有选项卡按钮的选中状态
  wcs810_tabs.forEach(function (wcs810_btn) {
    wcs810_btn.classList.remove('wcs810_active');
    wcs810_btn.setAttribute('aria-selected', 'false');
  });

  // 2. 清除所有面板的选中状态
  wcs810_panels.forEach(function (wcs810_panel) {
    wcs810_panel.classList.remove('wcs810_active');
  });

  // 3. 设置当前元素的选中状态
  wcs810_currentBtn.classList.add('wcs810_active');
  wcs810_currentBtn.setAttribute('aria-selected', 'true');

  // 4. 根据当前按钮的 data-wcs810-target 找到对应面板并显示
  const wcs810_targetSelector = wcs810_currentBtn.getAttribute('data-wcs810-target');
  const wcs810_targetPanel = document.querySelector(wcs810_targetSelector);
  if (wcs810_targetPanel) {
    wcs810_targetPanel.classList.add('wcs810_active');
  }
}

/*
 * 作者：王传淞
 * 建立时间：2026-11-02 13:40:08
 * 使用模型：Kimi-K3
 * 功能名称：初始化选项卡
 * 简介：按选择器查找选项卡容器，为容器内每个选项卡按钮注册 click
 *       事件监听，点击时调用 wcs810_activateTab 完成状态切换。
 *       页面中有多组选项卡时，可多次调用本函数分别初始化，实现复用。
 */
function wcs810_initTabs(wcs810_rootSelector) {
  const wcs810_root = document.querySelector(wcs810_rootSelector);
  if (!wcs810_root) {
    return;
  }

  // 只在当前容器内查询，保证多组选项卡互不干扰
  const wcs810_tabs = wcs810_root.querySelectorAll('.wcs810_tab-btn');
  const wcs810_panels = wcs810_root.querySelectorAll('.wcs810_tab-panel');

  wcs810_tabs.forEach(function (wcs810_btn) {
    // 事件监听：点击某个选项卡时切换选中状态
    wcs810_btn.addEventListener('click', function () {
      wcs810_activateTab(wcs810_tabs, wcs810_panels, wcs810_btn);
    });
  });
}

/*
 * 作者：王传淞
 * 建立时间：2026-11-02 13:40:08
 * 使用模型：Kimi-K3
 * 功能名称：页面加载完成后初始化新闻选项卡
 * 简介：监听 DOMContentLoaded 事件，待页面结构解析完成后，
 *       对新闻选项卡容器 #wcs810_newsTabs 进行初始化。
 */
document.addEventListener('DOMContentLoaded', function () {
  wcs810_initTabs('#wcs810_newsTabs');
});
