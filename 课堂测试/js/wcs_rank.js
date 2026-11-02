/*
 * 作者：王传淞
 * 建立时间：2026-11-02 14:26:00
 * 使用模型：TRAE
 * 功能名称：可复用 Tab 选项卡组件（点击排行）
 * 简介：对外提供 wcs_initTabs 初始化函数，可为页面中任意符合结构
 *       （按钮 .wcs_tab-btn + 面板 .wcs_tab-panel，按钮通过
 *       data-wcs-target 指向面板选择器）的选项卡容器绑定点击事件，
 *       切换时先清除所有选项卡与面板的选中状态，再设置当前元素的选中状态。
 */

/*
 * 作者：王传淞
 * 建立时间：2026-11-02 14:26:00
 * 使用模型：TRAE
 * 功能名称：设置当前选中项
 * 简介：先清除所有选项卡按钮与面板的 wcs_active 选中状态，
 *       再为当前点击的按钮及其 data-wcs-target 指向的面板添加选中状态。
 */
function wcs_activateTab(wcs_tabs, wcs_panels, wcs_currentBtn) {
  // 1. 清除所有选项卡按钮的选中状态
  wcs_tabs.forEach(function (wcs_btn) {
    wcs_btn.classList.remove('wcs_active');
    wcs_btn.setAttribute('aria-selected', 'false');
  });

  // 2. 清除所有面板的选中状态
  wcs_panels.forEach(function (wcs_panel) {
    wcs_panel.classList.remove('wcs_active');
  });

  // 3. 设置当前元素的选中状态
  wcs_currentBtn.classList.add('wcs_active');
  wcs_currentBtn.setAttribute('aria-selected', 'true');

  // 4. 根据当前按钮的 data-wcs-target 找到对应面板并显示
  const wcs_targetSelector = wcs_currentBtn.getAttribute('data-wcs-target');
  const wcs_targetPanel = document.querySelector(wcs_targetSelector);
  if (wcs_targetPanel) {
    wcs_targetPanel.classList.add('wcs_active');
  }
}

/*
 * 作者：王传淞
 * 建立时间：2026-11-02 14:26:00
 * 使用模型：TRAE
 * 功能名称：初始化选项卡
 * 简介：按选择器查找选项卡容器，为容器内每个选项卡按钮注册 click
 *       事件监听，点击时调用 wcs_activateTab 完成状态切换。
 *       页面中有多组选项卡时，可多次调用本函数分别初始化，实现复用。
 */
function wcs_initTabs(wcs_rootSelector) {
  const wcs_root = document.querySelector(wcs_rootSelector);
  if (!wcs_root) {
    return;
  }

  // 只在当前容器内查询，保证多组选项卡互不干扰
  const wcs_tabs = wcs_root.querySelectorAll('.wcs_tab-btn');
  const wcs_panels = wcs_root.querySelectorAll('.wcs_tab-panel');

  wcs_tabs.forEach(function (wcs_btn) {
    // 事件监听：点击某个选项卡时切换选中状态
    wcs_btn.addEventListener('click', function () {
      wcs_activateTab(wcs_tabs, wcs_panels, wcs_btn);
    });
  });
}

/*
 * 作者：王传淞
 * 建立时间：2026-11-02 14:26:00
 * 使用模型：TRAE
 * 功能名称：页面加载完成后初始化点击排行选项卡
 * 简介：监听 DOMContentLoaded 事件，待页面结构解析完成后，
 *       对排行选项卡容器 #wcs_rankTabs 进行初始化。
 */
document.addEventListener('DOMContentLoaded', function () {
  wcs_initTabs('#wcs_rankTabs');
});
