// 防复制样式+事件处理 - 让AI生成内容必须通过按钮复制
// user-select:none 对div有效但手机浏览器有长按菜单等旁路
import React from 'react';

// 样式：覆盖所有浏览器的前缀+触摸菜单禁止
export const noSelectStyle: React.CSSProperties = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  WebkitTouchCallout: 'none',  // iOS长按菜单
  WebkitUserDrag: 'none',
  KhtmlUserSelect: 'none',
};

// 事件处理：阻止复制/选中/拖拽
export const noSelectEvents = {
  onCopy: (e: React.ClipboardEvent) => { e.preventDefault(); },
  onCut: (e: React.ClipboardEvent) => { e.preventDefault(); },
  onSelectStart: (e: React.SyntheticEvent) => { e.preventDefault(); },
  onDragStart: (e: React.SyntheticEvent) => { e.preventDefault(); },
  onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); },  // 右键菜单
};
